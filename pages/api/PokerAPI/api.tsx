import axios from "axios";
import { issueType } from "../../../PokerStateManagement/Atom";
import firebase from "../../../firebase/firebase-config";
import { UserAddIcon } from "@heroicons/react/solid";
import { firestore } from "firebase";
import { nanoid } from 'nanoid'

const API_PATH : String = "https://scrum-poker-server-mintel.herokuapp.com/poker"
export const generateKey = (pre : string) => {
    return `${ pre }_${ new Date().getTime() }`;
}

export async function createRoom(roomName:string , username:string , maxFrontEndPoint:string , maxBackEndPoint:string , maxOtherPoint:string ){
    let res = await axios.post(`${API_PATH}/createroom/${roomName}/${username}`,{
        maxFrontEndPoint : maxFrontEndPoint,
        maxBackEndPoint : maxBackEndPoint,
        maxOtherPoint : maxOtherPoint,
    })
    return res.data as string[];
    
    // var roomid = nanoid(6)
    // var creatorid : any
    // const DateInSec = new Date();
    // const unixtime = DateInSec.valueOf()
    // const DateInFormat = new Date(unixtime)
    // var retdata = [roomid] as string[];
    // const creator = {
    //   "id" : '-',
    //   "name": username,
    //   "score": '-',
    //   "isHost": true,
    //   "profilePicture":'-',
    // }
    // const issue = {
    //   "name": "Untitled",
    //   "owner_name": '',
    //   "score": '-',
    //   "history": [{ "CreateDate": [DateInFormat], "average_score": '-' }],
    //   "id" : '0',
    //   "selected" : Boolean(false),
    //   "breakdown_time": Number(0),
    //   "voting_time":Number(0),
    // }
    
    // await firebase.firestore().collection("poker").doc(roomid).set({
    //   "ActiveDate": DateInFormat,
    //   "status" : Number(1),
    //   "roomName" : roomName,
    //   "votingSystem" : 'fibo',
    //   "isClearingScore" : false,
    // })
    //   .then(async docs => {
    //     creatorid = await firebase.firestore().collection("poker").doc(roomid).collection("members").add(creator)
    //     await firebase.database().ref(`poker/status/${creatorid.id}`).set("online");
    //     await firebase.firestore().collection('poker_user').doc(creatorid.id).set({
    //         'room':roomid
    //     })
    //     retdata.push(creatorid.id)
    //     await firebase.firestore().collection("poker").doc(roomid).collection("members").get()
    //     .then(docs => {
    //         firebase.firestore().collection("poker").doc(roomid).collection("members").doc(creatorid.id).update({
    //       'id' : creatorid.id
    //       })
    //     })
    //     firebase.firestore().collection("poker").doc(roomid).collection("issues").add(issue)
    //     .then(docs => {
    //         firebase.firestore().collection("poker").doc(roomid).update({'issues':[docs.id]})
    //     })
    //   })
    // return retdata
}

// export async function removeRoom(roomId:string){
//     await firebase.firestore().collection("poker").doc(roomId).delete();        
// }

export async function addMember(roomId: string, name: string) {
    let res = await axios.post(`${API_PATH}/member/${roomId}/${name}`);
    return res.data as string[];
    // const DateInSec = new Date();
    // const unixtime = DateInSec.valueOf()
    // interface member{
    //     "id" : string;
    //     "name" : string;
    //     "score" : string;
    //     "isHost": boolean;
    //     "profilePicture":string
    // }
    // const newMember: member = { 'id': '-','name': name, 'score': '-' , 'isHost' : false , "profilePicture" : '-' };
    // try{
    // const room = await firebase.firestore().collection("poker").doc(roomId).get();
    //     if(room.exists){
    //         const user = await firebase.firestore().collection("poker").doc(roomId).collection("members").add(newMember);
    //         firebase.database().ref(`poker/status/${user.id}`).set("online");
    //         await firebase.firestore().collection('poker_user').doc(user.id).set({
    //             'room':roomId
    //         })
    //         await firebase.firestore().collection("poker").doc(roomId).collection("members").doc(user.id).update({
    //             "id":user.id
    //         })
    //         let memberInRoomDocs =  await firebase.firestore().collection("poker").doc(roomId).collection("members").get();
    //         if(memberInRoomDocs.docs.length === 1){
    //             await firebase.firestore().collection("poker").doc(roomId).collection("members").doc(user.id).update({
    //                 'isHost': true
    //             })
    //         }
    //         return [user.id,room.id,room.data()?.roomName] as string[]
    //     }else{
    //         return ['Invalid pin']
    //     }
    // }catch(err){
    //     return ['Invalid pin']
    // } 
}

// export async function removeMember(roomId: string, userId: string){
//     await axios.delete(`${API_PATH}/${roomId}/${userId}`);
//     // let isUserExist = await firebase.firestore().collection("poker").doc(roomId).get();
//     // if(isUserExist.exists)
//     //     await firebase.firestore().collection("poker").doc(roomId).collection("members").doc(userId).delete();
// }

export async function updateVote(roomId:string,userId:string,vote:string){
    return await axios.put(`${API_PATH}/voting/${roomId}/${userId}/${vote}`)
}

export async function directUpdateFirebaseVote(roomId:string,userId:string,vote:string){
    await axios.put(`${API_PATH}/voting/${roomId}/${userId}`,{
        score:vote
    })
    // return await firebase.firestore().collection('poker').doc(roomId).collection("members").doc(userId)
    // .update({
    //     'score':vote
    // })
    
}

export async function resetVote(roomId:string){
    return await axios.put(`${API_PATH}/newvoting/${roomId}`)
}

export async function deleteIssue(roomId: string, issueId: string){
    await axios.delete(`${API_PATH}/issue/${roomId}/${issueId}`);
}

export async function direactFirebaseResetVote(roomId:string){
    await axios.put(`${API_PATH}/newvoting/${roomId}`);
    // await firebase.firestore().collection('poker').doc(roomId).update({
    //     "isClearingScore" : true
    // })

    // let allMemberInRoom = await firebase.firestore().collection('poker').doc(roomId).collection('members').get();
    // await Promise.all(allMemberInRoom.docs.map((doc)=>(
    //     firebase.firestore().collection('poker').doc(roomId).collection('members').doc(doc.id).update({
    //         'score' : '-'
    //     })
    // )))
    // await firebase.firestore().collection('poker').doc(roomId).update({
    //     "isClearingScore" : false
    // })
}

export async function updateStateReveal(roomId:string , status:number){
    return await axios.put(`${API_PATH}/setstatus/${roomId}/${status}`);
}

export async function directUpdateFirebaseStateReveal(roomId:string , state:number , issueSelected : string ){
    await axios.post(`${API_PATH}/setstatus/${roomId}/${roomId}/${state}`);
    // return await firebase.firestore().collection('poker').doc(roomId).update({
    //     'status' : state
    // });
}

export async function updateIssue(roomId:string , issueInRoom: Map<string, issueType>){
    function replacer(key:string, value:issueType) {
        if(value instanceof Map) {
          return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
          };
        } else {
          return value;
        }
      }
    let sendIssue = JSON.stringify(issueInRoom,replacer);
    await axios.post(`${API_PATH}/updateissue/${roomId}`,{
        data:sendIssue
    })
    // let iterator = issueInRoom.keys()
    // let id_data = [] as string[];
    // for(let i = 0 ; i < issueInRoom.size ; i++){
    //     let key = iterator.next().value;
    //     id_data.push(key);
    // }

    // await firebase.firestore().collection('poker').doc(roomId).update({
    //     "issues" : id_data
    //   })
    // await Promise.all(id_data.map((key)=>(
    //     firebase.firestore().collection('poker').doc(roomId).collection('issues').doc(key).update({
    //         "id" : issueInRoom.get(key)?.id,
    //         "score" : issueInRoom.get(key)?.score,
    //         "name" : issueInRoom.get(key)?.title,
    //         "selected" : issueInRoom.get(key)?.selected,
    //         "owner_name" : issueInRoom.get(key)?.ownerName,
    //         "breakdown_time":issueInRoom.get(key)?.breakdownTime,
    //         "voting_time":issueInRoom.get(key)?.votingTime,
    //     })
    // )))
}

export async function createIssue(roomId:string , id:string , title:string , ownerName : string , issueType:string[]){
    await axios.post(`${API_PATH}/issue/${roomId}/${id}`,{
        name:title,
        owner:ownerName,
        issueType:JSON.stringify(issueType)
    });
    // const DateInSec = new Date();
    // const unixtime = DateInSec.valueOf()
    // const DateInFormat = new Date(unixtime)
    // let docs = await firebase.firestore().collection("poker").doc(roomId).collection("issues").add({
    //     "name": title,
    //     "score": '-',
    //     "selected": Boolean(false),
    //     'id': id,
    //     "owner_name" : ownerName,
    //     "history": [{ "CreateDate": [DateInFormat], "average_score": '-' }],
    //     "breakdown_time": Number(0),
    //     "voting_time":Number(0)
    //   })
    // let issueid = docs.id as string;
    // let resultRoom =  await firebase.firestore().collection("poker").doc(roomId).get();
    // let newIssue = resultRoom.data()?.issues as Array<string>
    // newIssue.push(issueid)
    // await firebase.firestore().collection("poker").doc(roomId).update({
    //     'issues' : newIssue  
    // })
}

export async function updateBreakdownTime(roomId:string , idFromDB:string , newTime:number){
    return await axios.post(`${API_PATH}/updatebreakdowntime/${roomId}/${idFromDB}/${newTime}`);
    // let issueDoc = await firebase.firestore().collection('poker').doc(roomId).collection('issues').doc(idFromDB).get();
    // if(issueDoc.exists){
    //     await firebase.firestore().collection('poker').doc(roomId).collection('issues').doc(idFromDB).update({
    //         breakdown_time: newTime
    //     })
    // }
}

export async function updateVotingTime(roomId:string , idFromDB:string , newTime:number){
    return await axios.post(`${API_PATH}/updatevotingtime/${roomId}/${idFromDB}/${newTime}`);
    // let issueDoc = await firebase.firestore().collection('poker').doc(roomId).collection('issues').doc(idFromDB).get();
    // if(issueDoc.exists){
    //     await firebase.firestore().collection('poker').doc(roomId).collection('issues').doc(idFromDB).update({
    //         voting_time:newTime
    //     })
    // }
}

export async function updateBreakdownTimeAndVotingTime(roomId:string , idFromDB:string , newBreakdownTime:number , newVotingTime:number) {
    return await axios.post(`${API_PATH}/updatebdandvtime/${roomId}/${idFromDB}/${newBreakdownTime}/${newVotingTime}`);
    // let issueDoc = await firebase.firestore().collection('poker').doc(roomId).collection('issues').doc(idFromDB).get();
    // if(issueDoc.exists){
    //     await firebase.firestore().collection('poker').doc(roomId).collection('issues').doc(idFromDB).update({
    //         breakdown_time: newBreakdownTime,
    //         voting_time:newVotingTime
    //     })
    // }
}


// export async function removeIssueCollection(roomId:string){
//     let docs = await firebase.firestore().collection("poker").doc(roomId).collection("issues").get();
//     let docsId = [] as string[];
//     docs.forEach(doc=>docsId.push(doc.id));
//     await Promise.all([docsId.map((issueId)=>(
//         firebase.firestore().collection('poker').doc(roomId).collection('issues').doc(issueId).delete()
//     ))])
// }

export async function getAverageScore(roomId:string){
    let res = await firebase.firestore().collection('poker').doc(roomId).get();
    return res.data()?.averageScore
}

export async function updateAverageVote(roomId:string,averageVote:string){
    await axios.post(`${API_PATH}/updateaveragevote/${roomId}/${averageVote}`);
    // const DateInSec = new Date();
    // const unixtime = DateInSec.valueOf()
    // const DateInFormat = new Date(unixtime)
    // return await firebase.firestore().collection('poker').doc(roomId).update({
    //     "ActiveDate" : DateInFormat,
    //     "averageScore": averageVote
    // })
}

export async function changeName(roomId: string, userId: string, newUsername: string){
    await axios.put(`${API_PATH}/changename/${roomId}/${userId}/${newUsername}`);
    // const docs = firebase.firestore().collection("poker").doc(roomId).collection("members").doc(userId).update({
    //   'name': newUsername
    // })
}

export async function changeIssueName(roomId: string, issueId: string, title: string , ownerName:string , issueType:string[]): Promise<any> {
    await axios.put(`${API_PATH}/issue/${roomId}/${issueId}`,{
        name:title,
        owner:ownerName,
        issueType:JSON.stringify(issueType),
    });
    // await firebase.firestore().collection("poker").doc(roomId).collection("issues").doc(issueId).update({
    //   "name": title,
    //   "owner_name" : ownerName,
    // })
}

export async function handleLastPlayerCloseTab(roomId: string){
    await axios.delete(`${API_PATH}/${roomId}`);
}

export async function deleteOnePlayer(roomId: string , userId :string){
    await axios.delete(`${API_PATH}/member/${roomId}/${userId}`);
}

export async function updateVotingSystem(roomId:string , sequenceType:string){
    await axios.post(`${API_PATH}/updatevotingsystem/${roomId}/${sequenceType}`);
    // await Promise.all([direactFirebaseResetVote(roomId) , firebase.firestore().collection('poker').doc(roomId).update({
    //     "votingSystem" : sequenceType
    // })])
}

export async function startBreakdown(roomId:string) {
    await axios.post((`${API_PATH}/startbreakdown/${roomId}`))
}

export async function stopBreakdown(roomId:string) {
    await axios.post((`${API_PATH}/stopbreakdown/${roomId}`))
}

export async function startVoting(roomId:string) {
    await axios.post((`${API_PATH}/startVoting/${roomId}`))
}

export async function stopVoting(roomId:string) {
    await axios.post((`${API_PATH}/stopVoting/${roomId}`))
}

export async function updateUserPicture(userId:string , roomId:string , imgUrl:string){
    await axios.post(`${API_PATH}/updatepicture/${roomId}/${userId}`,{
        "base64":imgUrl
    });
    // await firebase.firestore().collection('poker').doc(roomId).collection('members').doc(userId).update({
    //     profilePicture:imgUrl
    // })
}

export async function convertImageUrlToBase64(url:string){
    let res = await axios.post(`${API_PATH}/base64`,{
        "url":url
    });
    return res.data as any
}

export async function sendMessage( roomId:string , memberId:string , message:string , name:string , profilePicture:string , imageUrl:string ){
    return await axios.post(`${API_PATH}/keepchat/${roomId}`,{
        memberId:memberId,
        message:message,
        name:name,
        profilePicture:profilePicture,
        imageUrl:imageUrl,
    })
}

export async function updateMaxFrontEndPoint(roomId:string , point:string ) {
    return await axios.post(`${API_PATH}/updateFEP/${roomId}/${point}`)
}

export async function updateMaxBackEndPoint(roomId:string , point:string ) {
    return await axios.post(`${API_PATH}/updateBEP/${roomId}/${point}`)
}

export async function updateMaxOtherPoint(roomId:string , point:string ) {
    return await axios.post(`${API_PATH}/updateOP/${roomId}/${point}`)
}

export async function updateIssueScore(roomId:string ,idFromDB: string , score:string ) {
    return await axios.post(`${API_PATH}/updatescore/${roomId}/${idFromDB}/${score}`);
}