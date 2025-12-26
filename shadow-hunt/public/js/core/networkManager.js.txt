// ==================================
// NETWORK MANAGER (FINAL – PASSIVE)
// ==================================
(function () {

  const firebaseConfig = {
    apiKey: "AIzaSyAdoF5S8NiWhQqxJ5L8M5C7-fXKTlX3uUE",
    authDomain: "shadow-hunt-game.firebaseapp.com",
    databaseURL: "https://shadow-hunt-game-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "shadow-hunt-game",
    storageBucket: "shadow-hunt-game.firebasestorage.app",
    messagingSenderId: "466420425994",
    appId: "1:466420425994:web:708f5730b1e11d306306f3"
  };

  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = firebase ? firebase.database() : null;

  function initOffline() {
    const lobby = document.getElementById('lobby-ui');
    if (lobby) lobby.style.display = 'none';

    STATE.localPlayerId = 'p2';

    if (window.BOT) BOT.start('p1');
  }

  function init(roomId, role) {
    if (!db) return;

    const roomRef = db.ref('rooms/' + roomId);
    const isHost = role === 'host';

    STATE.localPlayerId = isHost ? 'p2' : 'p1';
    const enemyId = isHost ? 'p1' : 'p2';

    roomRef.child('players/' + STATE.localPlayerId).set({
      active: true
    });

    setInterval(() => {
      if (!STATE.system.playable) return;
      const intent = INPUT_MANAGER.getIntent(STATE.localPlayerId);
      roomRef.child(`players/${STATE.localPlayerId}/input`).set(intent);
    }, 50);

    roomRef.child(`players/${enemyId}/input`).on('value', snap => {
      if (snap.val()) {
        INPUT_MANAGER.setRemoteIntent(enemyId, snap.val());
      }
    });

    roomRef.child('status').on('value', snap => {
      if (snap.val() === 'playing') {
        const lobby = document.getElementById('lobby-ui');
        if (lobby) lobby.style.display = 'none';
      }
    });
  }

  window.NETWORK = { init, initOffline };

})();
