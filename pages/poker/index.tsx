import React ,{FC, useEffect, useState} from 'react'
import type { ReactNode, ReactElement } from 'react';
import { motion ,AnimatePresence } from "framer-motion"
import PokerMenuDropDown from '../../components/PokerComponents/PokerMenuDropdown';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import PokerProfileMenuDropDown from '../../components/PokerComponents/PokerProfileMenu';
import PokerTable from '../../components/PokerComponents/PokerTable';
import { playersInRoom, PlayerInRoomType, UserData, issueBarState, issueType, issueDataState, RoomDataState, RoomDataType, UserDataType, isReveal, invitePopupState, averageVoteState, issueUpdateState, syncVotingSequenceState, isClearingScoreState, countdownState, countDownType, stateButtonTimeState, issueSelectedState, maxFrontEndPointState, maxBackEndPointState, maxOtherPointState } from '../../PokerStateManagement/Atom';
import IssueBar from '../../components/PokerComponents/IssueBar';
import PokerFooter from '../../components/PokerComponents/PokerFooter';
import firebase from '../../firebase/firebase-config';
import CreateRoom from '../../components/PokerComponents/CreateRoom';
import InvitePopup from '../../components/PokerComponents/InvitePopup';
import { deleteOnePlayer, directUpdateFirebaseStateReveal, getAverageScore, handleLastPlayerCloseTab, updateAverageVote, updateVote } from '../api/PokerAPI/api';
import GameSetting from '../../components/PokerComponents/GameSetting';
import Rename from '../../components/PokerComponents/Rename';
import EditIssues from '../../components/PokerComponents/EditIssues';
import { useRouter } from "next/router"
import { SnackbarProvider } from 'notistack';
import { Anchorme, LinkComponentProps } from 'react-anchorme'
import CSS from 'csstype'
import { useWindowSize } from 'usehooks-ts'
import Timer from '../../components/PokerComponents/Timer';
import StateButton from '../../components/PokerComponents/StateButton';
import ChangeProfilePicture from '../../components/PokerComponents/ChangeProfilePicture';
import AlertUserEvent from '../../components/PokerComponents/AlertUserEvent';
import RoomChat from '../../components/PokerComponents/RoomChat';
import FullChatImage from '../../components/PokerComponents/FullChatImage';

function StartLogo() {
    const [showLogo , setShowLogo] = useState<boolean>(true);

    useEffect(()=>{
        const timeout = setTimeout(()=>setShowLogo(false) , 1800);
        return ()=> clearTimeout(timeout);
    },[])

    return (
        <div className="w-full h-screen flex justify-center items-center">
            <AnimatePresence>
              {showLogo &&
              <motion.div
                animate={{ opacity: 1 ,scale: 1 ,rotateY:0 , y:20}}
                initial={{opacity : 0 , scale: 0.2 , rotateY:130 , y :100}}
                exit = {{ opacity : 0 , scale: 2 ,y:20 }}
                transition={{  duration: 1.5 }}
              >
                <img id="logo-mintel" className="w-48 sm:w-72 lg:w-96 xl:w-full" src={'/static/images/Icon/logoconnectx@2x.png'}/>
              </motion.div>}
            </AnimatePresence>
        </div>
    )
}

function PokerHeader() {
    const [userData , setUserData ] = useRecoilState(UserData);
    const [ allPlayerInRoom , setAllPlayerInRoom ] = useRecoilState(playersInRoom);
    const [ issueState , setIssueState ] = useRecoilState(issueBarState);
    const [ issueData , setIssueData ] = useRecoilState(issueDataState);
    const [ issueUpdate , setIssueUpdate ] = useRecoilState(issueUpdateState);
    const [ roomData , setRoomData ] = useRecoilState(RoomDataState);
    const [reveal ,setReveal] = useRecoilState(isReveal);
    const [ showInvitePopup , setShowInvitePopup ] = useRecoilState(invitePopupState);
    const [ averageVote ,setAverageVote ] = useRecoilState(averageVoteState);
    const [ isExpandMenuClick , setIsExpandMenuClick ] = useState<boolean>(false);
    const [ syncVotingSequence , setSyncVotingSequence ] = useRecoilState(syncVotingSequenceState);
    const [ isClearingScore , setIsClearingScore ] = useRecoilState(isClearingScoreState);
    const [ maxFrontEndPoint , setMaxFrontEndPoint ] = useRecoilState(maxFrontEndPointState)
    const [ maxBackEndPoint , setMaxBackEndPoint ] = useRecoilState(maxBackEndPointState); 
    const [ maxOtherPoint , setMaxOtherPoint ] = useRecoilState(maxOtherPointState);

    const router = useRouter()
    let unsubRoom = () => {}
    let unsubIssue = () =>{}
    let unsubMember= () => {}
    let unsubCheckPlayerInRoom = () => {}
    function showIssueTitle(){
        const CustomLink = (props: LinkComponentProps) => {
            return (
                <a className="text-blue" {...props} />
            )
          }
        let value = '';
        issueData.forEach((issue)=>{
            if(issue.selected){
                value = issue.title;
            }
        })
        return <Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{value}</Anchorme>
    }

    interface responseGetUserType{
        data:string
    }

    const reorder = (list:any[], startIndex:number, endIndex:number) => {
        let result = Array.from(list);
        let [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
      };
    
    //handle change routes
    useEffect(()=>{
        async function handleRouteChange(){
            if(userData.userId !== '-' && roomData.roomId !== '-') {
                firebase.database().ref(`poker/status/${userData.userId}`).set('offline')
            }
        }
        router.events.on("beforeHistoryChange",()=>handleRouteChange())
        return ()=>router.events.off("beforeHistoryChange",()=>handleRouteChange());
    },[userData,roomData,allPlayerInRoom])

    interface allResponesIssueType{
        issues: string[];
    }

    interface eachResonesIssueType{
        name : string ;
        score : string ;
        id : string ;
        selected : boolean;
        owner_name : string;
        breakdown_time:number;
        voting_time:number;
        issue_type:string[];
    }
    interface responseStatus{
        status: number;
        averageScore:string;
    }

    // handle issue
    useEffect(()=>{
        if(roomData.roomId !== '-' && userData.userId!=='-'){
            unsubRoom = firebase.firestore().collection('poker').doc(roomData.roomId)
                .onSnapshot(async(docs)=>{
                    if(!docs.exists){
                        //handle host leave
                        let user = {} as UserDataType;
                        user.username = '-';
                        user.profilePicture = 'data:image/jpeg;base64,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';
                        user.userId = '-';
                        user.isHost = false;
                        let room = {} as RoomDataType;
                        room.roomname = '-';
                        room.roomId = '-';
                        setUserData(user);
                        setRoomData(room);
                        unsubRoom();unsubIssue();unsubMember();
                    }
                    else{
                    //update room state
                        let getReveal = docs.data() as responseStatus;
                        setReveal(getReveal.status);
                        setAverageVote(getReveal.averageScore);
                        setSyncVotingSequence(docs.data()?.votingSystem);
                        setIsClearingScore(docs.data()?.isClearingScore);
                        setMaxFrontEndPoint(docs.data()?.maxFrontEndPoint);
                        setMaxBackEndPoint(docs.data()?.maxBackEndPoint);
                        setMaxOtherPoint(docs.data()?.maxOtherPoint);
                        let result = docs.data() as allResponesIssueType;
                        let allIssue = [] as issueType[];
                        let issueResult =await Promise.all( result.issues.map((issue)=>(                  
                            firebase.firestore().collection('poker').doc(`${roomData.roomId}`).collection('issues').doc(issue).get().then(docs=>{return docs.data()})
                        )));
                        issueResult.forEach((resIssue,index)=>{
                            let issue = {} as issueType
                            let resIssue2 = resIssue as eachResonesIssueType
                            issue.title = resIssue2?.name;
                            issue.selected = resIssue2?.selected;
                            issue.id = resIssue2?.id;
                            issue.score = resIssue2?.score;
                            issue.ownerName = resIssue2?.owner_name;
                            issue.breakdownTime = resIssue2?.breakdown_time;
                            issue.votingTime = resIssue2?.voting_time;
                            issue.issueType = resIssue2?.issue_type;
                            issue.idFromDB = result?.issues[index];   
                            allIssue.push(issue);
                        })
                        setIssueData(allIssue);
                    }
                })
            
                unsubIssue = firebase.firestore().collection('poker').doc(roomData.roomId).collection('issues')
                    .onSnapshot(async(docs)=>{
                        let allIssueId = [] as string[]
                        docs.forEach((doc)=>{allIssueId.push(doc.id)})
                        let issueResult = await Promise.all(allIssueId.map((issueId)=>(
                            firebase.firestore().collection('poker').doc(roomData.roomId).collection('issues').doc(issueId).get()
                        )))
                        let resultAllIssueIdSorted = await firebase.firestore().collection('poker').doc(roomData.roomId).get(); 
                        let allIssue = [] as issueType[];
                        for(let i = 0; i < resultAllIssueIdSorted.data()?.issues.length ; i++){
                            for(let j = 0 ; j < issueResult.length ; j++){
                                if(resultAllIssueIdSorted.data()?.issues[i] === issueResult[j].id){
                                    let issue = {} as issueType
                                    issue.title = issueResult[j].data()?.name;
                                    issue.selected = issueResult[j].data()?.selected;
                                    issue.id = issueResult[j].data()?.id;
                                    issue.score = issueResult[j].data()?.score;
                                    issue.ownerName = issueResult[j].data()?.owner_name;
                                    issue.breakdownTime = issueResult[j].data()?.breakdown_time;
                                    issue.votingTime = issueResult[j].data()?.voting_time;
                                    issue.issueType = issueResult[j].data()?.issue_type;
                                    issue.idFromDB = resultAllIssueIdSorted.data()?.issues[i];
                                    allIssue.push(issue);
                                    break;
                                }
                            }
                        }
                        setIssueData(allIssue);
                    })      
        }
        return ()=>{
            unsubRoom() 
            unsubIssue()
        };
    },[roomData ])

    useEffect(()=>{
        if(userData.userId !== '-' && roomData.roomId !== '-'){
            (async function(){
                let average = await getAverageScore(roomData.roomId);
                setAverageVote(average);
            }())
            unsubMember = firebase.firestore().collection('poker').doc(`${roomData.roomId}`).collection('members')
            .onSnapshot(snap => {
                let players = [] as PlayerInRoomType[];
                let player = {} as PlayerInRoomType;
                let indexOwner = 0;
                let i = 0;
                snap.forEach(docs=> {
                    player = {} as PlayerInRoomType;
                    player.id = docs.data()?.id;
                    player.name = docs.data()?.name;
                    player.vote = docs.data()?.score;
                    player.isHost = docs.data()?.isHost;
                    player.profilePicture = docs.data()?.profilePicture;
                    players.push(player); 
                    if(docs.id === userData.userId)
                        indexOwner = i;
                    i++;
                })
                players = reorder(players , indexOwner , 0);        
                setAllPlayerInRoom(players)
            })

            unsubCheckPlayerInRoom = firebase.firestore().collection('poker').doc(`${roomData.roomId}`).collection('members').doc(userData.userId)
                .onSnapshot(docs =>{
                    if(!docs.exists){
                        firebase.database().ref(`poker/status/${userData.userId}`).set('offline')
                        let user = {} as UserDataType;
                        user.username = '-';
                        user.profilePicture = '/static/images/bg/Group 1@3x.png';
                        user.userId = '-';
                        user.isHost = false;
                        let room = {} as RoomDataType;
                        room.roomname = '-';
                        room.roomId = '-';
                        setUserData(user);
                        setRoomData(room);
                        unsubRoom();unsubIssue();unsubMember();unsubCheckPlayerInRoom();
                    }
                });
            firebase.database().ref(`poker/status/${userData.userId}`).onDisconnect().set('offline')
        }
        return ()=>{unsubMember() ; unsubCheckPlayerInRoom() ;}
    },[userData , roomData ])

    return (
        <div className="w-full flex justify-between items-start relative overflow-y-visible overflow-x-clip">
            <div className='flex flex-col items-left ml-7 mt-7'>
                <PokerMenuDropDown/>
                <div className='flex justify-start items-start ml-4 mt-2 gap-1'>
                    <p className="text-secondary-gray-3">Voting:</p>
                    <p className="break-words w-72 sm:w-fit sm:max-w-xs lg:max-w-md xl:max-w-xl">{showIssueTitle()}</p> 
                </div>
            </div>
            <ChangeProfilePicture/>
            <Rename/>
            <EditIssues/>
            <InvitePopup showInvitePopup={showInvitePopup} setShowInvitePopup={setShowInvitePopup}/>
            <div className="hidden md:flex justify-center items-center gap-3 mt-8 mr-7">
                <PokerProfileMenuDropDown />
                <div className="flex justify-center items-center border-2 border-blue bg-white hover:bg-primary-blue-3 cursor-pointer gap-2 px-2 lg:px-4 py-2 rounded-lg"
                    onClick={()=>setShowInvitePopup(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <p className="hidden lg:flex text-blue font-semibold text-h4">Invite members</p> 
                </div>
                <div className="flex justify-center items-center p-2 border-2 rounded-lg border-blue bg-white hover:bg-primary-blue-3 cursor-pointer"
                    onClick={()=>{setIssueState(true)}}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </div>
            </div>
            <div className='flex mt-8 mr-7 md:hidden justify-start items-center bg-white absolute gap-3 drop-shadow-md rounded-full ease-in-out duration-300' style={{width:500 , right: isExpandMenuClick ? '-150px' : '-440px'}}>
                    {isExpandMenuClick ?
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 p-2 mt-1 ml-1 mb-1 mr-5 bg-primary-blue-2 text-white rounded-full hover:bg-primary-blue-1 ease-in duration-150 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        onClick={()=>setIsExpandMenuClick(false)}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    :<svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 p-2 mt-1 ml-1 mb-1 mr-5 bg-primary-blue-2 text-white rounded-full hover:bg-primary-blue-1 ease-in duration-150 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        onClick={()=>setIsExpandMenuClick(true)}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>}
                <PokerProfileMenuDropDown />
                <div className="flex justify-center items-center border-2 border-blue bg-white hover:bg-primary-blue-3 cursor-pointer gap-2 px-2 py-2 rounded-lg"
                    onClick={()=>setShowInvitePopup(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <div className="flex justify-center items-center p-2 border-2 rounded-lg border-blue bg-white hover:bg-primary-blue-3 cursor-pointer"
                    onClick={()=>{setIssueState(true)}}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </div>
            </div>
        </div>
    )
  }

function Poker(){
    const [ showStartLogo , setShowStartLogo ] = useState<boolean>(true);
    const { width , height } = useWindowSize()
    const containerAnchorOriginTopCenter:CSS.Properties={
        overflow:'clip',
        width: width> 500 ?  '500px': '' ,
        display: 'flex',
        flexWrap:'wrap',
        wordBreak:'break-all',
        justifyContent:'space-around',
    }

    useEffect(()=>{
        const timeout = setTimeout(()=>setShowStartLogo(false), 3500);

        return ()=> clearTimeout(timeout);
    },[])

    return (
        <RecoilRoot> 
            {showStartLogo ? <StartLogo/>:
                <SnackbarProvider
                    maxSnack={3}
                    style={containerAnchorOriginTopCenter}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                > 
                    <AlertUserEvent/>
                    <CreateRoom/>
                    <GameSetting/>
                    <FullChatImage/>
                    <RoomChat/>
                    <div className="w-full h-screen flex flex-col items-center relative overflow-x-clip">
                            <IssueBar/>
                            <PokerHeader/>
                            <Timer/>
                            <StateButton/>  
                            <PokerTable/>
                            <PokerFooter/>
                    </div> 
                </SnackbarProvider>
            }
        </RecoilRoot>
    );
}



// export const getStaticProps = async () => {
//     const env  = {
//       hashCrypto: process.env.NEXT_PUBLIC_HASH_CRYPTO,
//       dataToken: process.env.NEXT_PUBLIC_DATA_TOKEN,
//     }

//     return { props: {
//       env: JSON.stringify(env)
//     } };
// }

// Poker.getLayout = (page : ReactElement) => (<Layout>{page}</Layout>)

export default Poker;