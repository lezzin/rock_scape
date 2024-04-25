const firebaseConfig = {
    apiKey: "AIzaSyA_dGAHObDD_Xsl3O-hyKpUuSxqlgmiWGY",
    authDomain: "rock-scape.firebaseapp.com",
    projectId: "rock-scape",
    storageBucket: "rock-scape.appspot.com",
    messagingSenderId: "711498178683",
    appId: "1:711498178683:web:7791412af46030c52082de",
    measurementId: "G-2CQ4MQCS78"
};


firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const provider = new firebase.auth.GoogleAuthProvider();

firebase.analytics();