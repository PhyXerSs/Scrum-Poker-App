import { ToggleButton } from '@mui/material'
import React, { useState ,Fragment, ReactChild, useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { issueDataState, issueSelectedState, issueType, issueUpdateState, playersInRoom, RoomDataState, stateButtonTimeState, timeBreakdownState, timeVotingState, UserData } from '../../PokerStateManagement/Atom'
import { createIssue, deleteIssue, startBreakdown, startVoting, stopBreakdown, stopVoting, updateBreakdownTime, updateBreakdownTimeAndVotingTime, updateIssue, updateVotingTime } from '../../pages/api/PokerAPI/api'
import firebase from '../../firebase/firebase-config';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import * as firebaseServer from 'firebase';
import CircularProgress from '@mui/material/CircularProgress';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

function StateButton () {
    const [stateButtonTime , setStateButtonTime] = useRecoilState(stateButtonTimeState);
    const userData = useRecoilValue(UserData);
    const roomData = useRecoilValue(RoomDataState);
    const issueData = useRecoilValue(issueDataState);
    const [ issueUpdate  , setIssueUpdate] = useRecoilState(issueUpdateState);
    const [ timeBreakdown , setTimeBreakdown ] = useRecoilState(timeBreakdownState);
    const [ timeVoting , setTimeVoting ] = useRecoilState(timeVotingState);
    const [ issueSelectedIdFromDB , setIssueSelectedIdFromDB ] = useState<string>('')
    const [issueSelected , setIssueSelected] = useRecoilState(issueSelectedState);
    const allPlayerInRoom = useRecoilValue(playersInRoom);
    const [ shouldUpdateTime , setShouldUpdateTime ] = useState<boolean>(false);
    const [ hideThisComponent , setHideThisComponent ] = useState<boolean>(false);
    const [ isLoading , setIsLoading ] = useState<boolean>(false);
    useEffect(()=>{
        let anyIssueSelected = false;
        issueData.forEach((issue)=>{
            if(issue.selected){
                anyIssueSelected = true;
            }
            if(issue.selected && issue.idFromDB !== issueSelected.idFromDB){
                setIssueSelected(issue);
            }
        })
        if(!anyIssueSelected && issueSelected.idFromDB !== '-'){
            let defaultIssue = {} as issueType;
            defaultIssue.title = '-';
            defaultIssue.score = '-',
            defaultIssue.selected = false;
            defaultIssue.id ='-';
            defaultIssue.idFromDB ='-';
            defaultIssue.ownerName = '-';
            defaultIssue.breakdownTime = 0;
            defaultIssue.votingTime = 0;
            setIssueSelected(defaultIssue)
        }
    },[issueData])
    useEffect(()=>{  
        setTimeBreakdown(issueSelected.breakdownTime);
        setTimeVoting(issueSelected.votingTime);
        setIssueSelectedIdFromDB(issueSelected.idFromDB);
    },[issueSelected])
    

    useEffect(()=>{
        (async function(){
            if(allPlayerInRoom!==null  && allPlayerInRoom[0]?.isHost && issueSelectedIdFromDB !== ''  && shouldUpdateTime){
                try{
                    await updateBreakdownTimeAndVotingTime(roomData.roomId , issueSelectedIdFromDB ,timeBreakdown , timeVoting);
                    firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                        "isUpdateToFirestore": true
                    })
                    setShouldUpdateTime(false);
                }catch(err){
                    console.log(err);
                    
                }
            }
        }())
        
    },[shouldUpdateTime,issueSelectedIdFromDB,allPlayerInRoom,timeBreakdown,timeVoting])

    useEffect(()=>{
        let startBreakdownInterval:NodeJS.Timer;
        let startVotingInterval:NodeJS.Timer;
        let serverTimeOffset = 0;
        firebase.database().ref(".info/serverTimeOffset").on("value", (snapshot) => { serverTimeOffset = snapshot.val() });
        firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).on('value',async(snapshot) =>{
            if(snapshot.val() !== null){
                let isStartBreakdown = snapshot.val().isStartBreakdown;
                let startBreakDownAt = snapshot.val().startBreakDownAt;
                let isStartVoting = snapshot.val().isStartVoting;
                let startVotingAt = snapshot.val().startVotingAt;
                let timeBeforeStartBreakdown = snapshot.val().timeBeforeStartBreakdown;
                let timeBeforeStartVoting = snapshot.val().timeBeforeStartVoting;
                let deleteissue = snapshot.val().deleteIssue;
                let issueSelected = snapshot.val().issueSelected;
                let isUpdateToFirestore = snapshot.val().isUpdateToFirestore;
                let shouldUpdateToFireStore = snapshot.val().shouldUpdateToFireStore;
                let isResetBreakdownTime = snapshot.val().isResetBreakdownTime;
                let isResetVotingTime = snapshot.val().isResetVotingTime;
                clearInterval(startBreakdownInterval);
                clearInterval(startVotingInterval);
                if(isStartBreakdown){
                    setStateButtonTime(1)
                    startBreakdownInterval = setInterval(()=>{
                        let timeNow = Date.now() - startBreakDownAt + serverTimeOffset;
                        setTimeBreakdown(timeNow/1000 + timeBeforeStartBreakdown)
                    },300)
                }
                if(isStartVoting){
                    setStateButtonTime(2);
                    startVotingInterval = setInterval(()=>{
                        let timeNow = Date.now() - startVotingAt +serverTimeOffset;           
                        setTimeVoting(timeNow/1000 + timeBeforeStartVoting)
                    },300)
                }
                if(!isStartBreakdown && !isStartVoting){     
                    clearInterval(startBreakdownInterval);
                    clearInterval(startVotingInterval);             
                    if(shouldUpdateToFireStore)
                        setShouldUpdateTime(true);
                    else{
                        setStateButtonTime(0);
                        setIsLoading(false);
                    }

                    if(isUpdateToFirestore){
                        setStateButtonTime(0);
                        setIsLoading(false);
                    }      
                }
                if(isResetBreakdownTime){
                    setTimeBreakdown(0);
                }
                if(isResetVotingTime){
                    setTimeVoting(0);
                }
            }
        })
        return ()=>{
            clearInterval(startBreakdownInterval);
            clearInterval(startVotingInterval);
            firebase.database().ref(".info/serverTimeOffset").off();
            firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).off()
            
        };


    },[roomData,userData])
    const Timer = async(presentState:number , nextState:number) => {
        if(presentState === 0 && nextState === 1){
            setShouldUpdateTime(false);
            if(issueSelectedIdFromDB !== ''){
                let timeBeforeStartBreakdown = 0;
                issueData.forEach((issue)=>{
                    if(issue.idFromDB === issueSelectedIdFromDB){
                        timeBeforeStartBreakdown = issue.breakdownTime;
                    }
                })         
                firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).set({
                    "isStartBreakdown" : true,
                    "startBreakDownAt" : firebaseServer.database.ServerValue.TIMESTAMP,
                    "isStartVoting":false,
                    "startVotingAt": 0,
                    "timeBeforeStartBreakdown":timeBeforeStartBreakdown,
                    "timeBeforeStartVoting":0,
                    "deleteIssue":'-',
                    "issueSelected" : issueSelectedIdFromDB,
                    "isUpdateToFirestore" : false,
                    "shouldUpdateToFireStore": true,
                    "isResetBreakdownTime":false,
                    "isResetVotingTime":false
                })
            }
            else{
                firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).set({
                    "isStartBreakdown" : true,
                    "startBreakDownAt" : firebaseServer.database.ServerValue.TIMESTAMP,
                    "isStartVoting":false,
                    "startVotingAt": 0,
                    "timeBeforeStartBreakdown":0,
                    "timeBeforeStartVoting":0,
                    "deleteIssue":'-',
                    "issueSelected" : issueSelectedIdFromDB,
                    "isUpdateToFirestore" : false,
                    "shouldUpdateToFireStore": true,
                    "isResetBreakdownTime":false,
                    "isResetVotingTime":false
                })
            }
        }
        else if (presentState === 0 && nextState === 2) {
            setShouldUpdateTime(false);
            if(issueSelectedIdFromDB !== ''){
                let timeBeforeStartVoting = 0;
                issueData.forEach((issue)=>{
                    if(issue.idFromDB === issueSelectedIdFromDB){
                        timeBeforeStartVoting = issue.votingTime;
                    }
                })
                firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).set({
                    "isStartBreakdown" : false,
                    "startBreakDownAt" : 0,
                    "isStartVoting":true,
                    "startVotingAt": firebaseServer.database.ServerValue.TIMESTAMP,
                    "timeBeforeStartBreakdown":0,
                    "timeBeforeStartVoting":timeBeforeStartVoting,
                    "deleteIssue":'-',
                    "issueSelected" : issueSelectedIdFromDB,
                    "isUpdateToFirestore" : false,
                    "shouldUpdateToFireStore": true,
                    "isResetBreakdownTime":false,
                    "isResetVotingTime":false
                })
            }
            else{
                firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).set({
                    "isStartBreakdown" : false,
                    "startBreakDownAt" : 0,
                    "isStartVoting":true,
                    "startVotingAt": firebaseServer.database.ServerValue.TIMESTAMP,
                    "timeBeforeStartBreakdown":0,
                    "timeBeforeStartVoting":0,
                    "deleteIssue":'-',
                    "issueSelected" : issueSelectedIdFromDB,
                    "isUpdateToFirestore" : false,
                    "shouldUpdateToFireStore": true,
                    "isResetBreakdownTime":false,
                    "isResetVotingTime":false
                })
            }
        }
        else if (presentState === 1) {
            setIsLoading(true);
            firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                "isStartBreakdown" : false,
                "startBreakDownAt" : 0,
                "deleteIssue":'-',
            })
             
        }
        else if (presentState === 2) {
            setIsLoading(true);
            firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                "isStartVoting" : false,
                "startVotingAt" : 0,
                "deleteIssue":'-',
            })
        }
    }

    function secondsToTime(sec:number){
        var h = Math.floor(sec / 3600).toString().padStart(2,'0'),
        m = Math.floor(sec % 3600 / 60).toString().padStart(2,'0'),
        s = Math.floor(sec % 60).toString().padStart(2,'0');
        return h + ':' + m + ':' + s;
    } 

    function showButtonBreakdownTime(){
        if(stateButtonTime === 0 || stateButtonTime === 2){
            return(
                <button className={`flex flex-col w-12 justify-center items-center text-h5 text-white py-1 rounded-xl ease-in duration-200 ${ stateButtonTime === 0 ? 'cursor-pointer' : 'cursor-not-allowed'}`} style={{backgroundColor:stateButtonTime === 0 ? '#339dfe' : '#eaf2fb'}}
                        onClick={()=>{
                            if(stateButtonTime===0)
                                Timer(0,1)
                        }}
                    >
                        <PlayArrowIcon fontSize='small' style={{color:'white'}}/>
                        <p>Start</p>
                </button>   
            );
        }
        if(stateButtonTime === 1){
            return(
                <button className={`flex flex-col w-12 justify-center items-center text-h5 text-white py-1 rounded-xl ease-in duration-200 ${ stateButtonTime === 1 ? 'cursor-pointer' : 'cursor-not-allowed'}`} style={{backgroundColor:stateButtonTime === 1 ? '#FF96AD' : '#eaf2fb'}}
                        onClick={()=>{
                            if(stateButtonTime === 1){
                                Timer(1,0)         
                            }
                        }}
                    >
                        {isLoading ? <CircularProgress size={'20px'} style={{color:'white'}}/>
                        :<StopIcon fontSize='small' style={{color:'white'}}/>    
                        }
                        Stop
                </button>
            );
        }
    }

    function showButtonVotingTime(){
        if(stateButtonTime === 0 || stateButtonTime === 1){
            return(
                    <button className={`flex flex-col w-12 justify-center items-center text-h5 text-white py-1 rounded-xl ease-in duration-200 ${ stateButtonTime === 0 ? 'cursor-pointer' : 'cursor-not-allowed'}`} style={{backgroundColor:stateButtonTime === 0 ? '#339dfe' : '#eaf2fb'}}
                        onClick={()=>{
                            if(stateButtonTime === 0){
                                Timer(0,2)
                            }
                        }}
                    >
                        <PlayArrowIcon fontSize='small' style={{color:'white'}}/>
                        <p>Start</p>
                    </button>
            );
        }
        if(stateButtonTime === 2){
            return(
                <button className={`flex flex-col w-12 justify-center items-center text-h5 text-white  py-1 rounded-xl ease-in duration-200 ${ stateButtonTime === 2 ? 'cursor-pointer' : 'cursor-not-allowed'}`} style={{backgroundColor:stateButtonTime === 2 ? '#FF96AD' : '#eaf2fb'}}
                        onClick={()=>{
                            if(stateButtonTime === 2)
                                Timer(2,0)
                        }}
                    >
                        {isLoading ? <CircularProgress size={'20px'} style={{color:'white'}}/>
                        :<StopIcon fontSize='small' style={{color:'white'}}/>    
                        }
                        Stop
                </button>
            );
        }
    }

    return (
        <div className="absolute flex flex-col rounded-2xl px-4 py-4 drop-shadow-lg gap-4 duration-150 ease-in" style={{ backgroundColor:'#edf4fc' , zIndex:1  , left:hideThisComponent ?'-245px' :'34px' ,top:'237px' ,transform:hideThisComponent?'scale(1)':'scale(1)'}}>
            <div className={`absolute top-0 py-2 px-2 items-center justify-end bg-white rounded-full flex duration-100 ease-in ${hideThisComponent? 'w-fit':'w-20'}`} style={{backgroundColor:'#edf4fc' , right:hideThisComponent?'-101px':'-28px'}}>
                {hideThisComponent ?
                <HourglassBottomIcon sx={{ fontSize: 40 }} className=" px-[5px] py-[5px] text-primary-blue-2 hover:text-tertiary-light-sky-blue cursor-pointer"
                    onClick={()=>setHideThisComponent(false)}
                />
                :<svg xmlns="http://www.w3.org/2000/svg" className={`h-9 w-9 text-primary-blue-2 hover:text-tertiary-light-sky-blue cursor-pointer`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    onClick={()=>setHideThisComponent(true)}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>}
            </div>
            
            <div className="flex justify-center items-start rounded-xl px-4 py-2 drop-shadow-sm gap-3" style={{backgroundColor:'#ffffff' }}>

                <div className="flex flex-col items-center">
                    <p className="font-bold" style={{fontSize:'16px' ,color:'#25396f'}}>Breakdown</p>
                    <div className="flex justify-center items-center rounded-xl px-4 py-2 mt-2 w-28" style={{background:"#eaf2fb"}}>
                        <p className='font-semibold' style={{fontSize:'20px' , color:'#25396f'}}>{secondsToTime(timeBreakdown)}</p>
                    </div>
                </div>
                <div className="flex flex-col justify-center items-center" style={{gap:'6px' , marginTop:'33px'}}>
                    {showButtonBreakdownTime()}
                </div>
            </div>

            <div className="flex justify-center items-start rounded-xl px-4 py-2 drop-shadow-sm gap-3" style={{backgroundColor:'#ffffff' }}>

                <div className="flex flex-col items-center">
                    <p className="font-bold" style={{fontSize:'16px' ,color:'#25396f'}}>Voting Time</p>
                    <div className="flex justify-center items-center rounded-xl px-4 py-2 mt-2 w-28" style={{background:"#eaf2fb"}}>
                        <p className='font-semibold' style={{fontSize:'20px' , color:'#25396f'}}>{secondsToTime(timeVoting)}</p>
                    </div>
                </div>
                <div className="flex flex-col justify-center items-center" style={{gap:'6px' , marginTop:'33px'}}>
                    {showButtonVotingTime()}
                </div>
            </div>
        </div>
        )
}

export default StateButton