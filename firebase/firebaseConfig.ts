import firebase from 'firebase';
const firebaseConfig = {
  apiKey: "AIzaSyClLxqZDMlHsZg9ofptNj_IsSdF_lvNylc",
  authDomain: "poker-2c494.firebaseapp.com",
  databaseURL: "https://poker-2c494-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poker-2c494",
  storageBucket: "poker-2c494.appspot.com",
  messagingSenderId: "40517616525",
  appId: "1:40517616525:web:d5775bb9f8bd336ae7f3c4"
};
try {
  firebase.initializeApp(firebaseConfig);
} catch(err:any){
  if (!/already exists/.test(err.message)) {
    console.error('Firebase initialization error', err.stack)}
}
const fire = firebase;
export default fire;