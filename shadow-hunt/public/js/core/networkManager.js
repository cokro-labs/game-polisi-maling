// ==================================
// NETWORK MANAGER (V3 - HOST START)
// ==================================
(function() {

  let firebaseRef = null;
  let onReadyCallback = null;       // Called when the local setup is ready
  let onOpponentJoined = null;    // Called for the host when a player joins
  let onGameStartSignal = null;   // Called for both when host starts the game
  let roomRole = null;
  let roomId = null;

  function initFirebase() {
    if (!window.firebase) return console.error("Firebase not loaded!");
    if (firebase.apps.length === 0) firebase.initializeApp(CONFIG.FIREBASE);
    firebaseRef = firebase.database().ref('rooms');
  }

  function isHost() {
    return roomRole === 'host';
  }

  function listenForGameStart() {
    const startRef = firebaseRef.child(roomId).child('system/gameStarted');
    startRef.on('value', (snap) => {
      if (snap.val() === true) {
        console.log("[NETWORK] Received start signal from host.");
        if (onGameStartSignal) onGameStartSignal();
        startRef.off(); // Stop listening after starting
      }
    });
  }

  function connectToRoom() {
    const roomRef = firebaseRef.child(roomId);
    
    // Listen for the start signal regardless of role
    listenForGameStart();

    if (isHost()) {
      const hostData = { host: { online: true }, join: { online: false }, system: { gameStarted: false } };
      roomRef.set(hostData);
      roomRef.child('join/online').on('value', (snap) => {
        if (snap.val() === true) {
          console.log("[NETWORK] Opponent has joined the room.");
          STATE.setOpponentConnected(true);
          if (onOpponentJoined) onOpponentJoined(); // NEW: Signal UI to show start button
          roomRef.child('join/online').off();
        }
      });
      // Host is ready immediately for lobby
      if (onReadyCallback) onReadyCallback();

    } else { // Is Joiner
      const joinRef = roomRef.child('join');
      joinRef.onDisconnect().set({ online: false });
      joinRef.update({ online: true });
      STATE.setOpponentConnected(true);

      // Listen for host state changes
      roomRef.child('host/state').on('value', (snap) => {
        if (snap.val() && onStateUpdateCallback) onStateUpdateCallback(snap.val());
      });

      // Joiner is ready immediately for lobby
      if (onReadyCallback) onReadyCallback();
    }
  }

  function syncClientInput() {
    if (isHost() || !firebaseRef) return;
    const input = INPUT_MANAGER.getIntent(STATE.localPlayerId);
    firebaseRef.child(roomId).child('join/state/input').set(input);
  }

  function syncHostState() {
    if (!isHost() || !firebaseRef) return;
    // Include round manager state in sync
    const syncData = {
      players: STATE.players,
      system: {
        tick: STATE.system.tick,
        winner: STATE.system.winner,
        inCountdown: ROUND.isCountdown(),
        countdown: ROUND.getCountdown()
      }
    };
    firebaseRef.child(roomId).child('host/state').set(syncData);
  }

  // --- Public API ---
  window.NETWORK = {
    init(id, role, callbacks) {
      roomId = id;
      roomRole = role;
      onReadyCallback = callbacks.onReady; // For lobby UI
      onOpponentJoined = callbacks.onOpponentJoined; // For host's start button
      onGameStartSignal = callbacks.onGameStart; // To start the actual game
      onStateUpdateCallback = callbacks.onStateUpdate;

      STATE.setLocalPlayerId(isHost() ? 'p1' : 'p2');
      initFirebase();
      connectToRoom();
    },

    initOffline(onReady) {
      roomId = 'offline';
      roomRole = 'host';
      STATE.setLocalPlayerId('p1');
      STATE.setOpponentConnected(true);
      if (window.BOT) BOT.start('p2');
      // For offline, ready means start
      if (onReady) onReady();
    },

    signalStartGame() {
        if (!isHost() || !firebaseRef) return;
        console.log("[NETWORK] Host is starting the game.");
        firebaseRef.child(roomId).child('system/gameStarted').set(true);
    },
    
    syncHostState,
    syncClientInput
  };

})();
