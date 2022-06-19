import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil';
import { averageVoteState, invitePopupState, isReveal, issueDataState, issueUpdateState, loadingState, localResetVoteState, PlayerInRoomType, playersInRoom, RoomDataState, stateButtonTimeState, UserData, UserDataType } from '../../PokerStateManagement/Atom';
import { useTimer } from 'use-timer';
import { AnimatePresence ,motion} from 'framer-motion';
import { direactFirebaseResetVote, directUpdateFirebaseStateReveal, resetVote, updateAverageVote, updateStateReveal } from '../../pages/api/PokerAPI/api';
import firebase from '../../firebase/firebase-config';
import CircularProgress from '@mui/material/CircularProgress';
import ResetButton from './ResetButton';
interface PlayerCardProps{
    vote:number
}

function PokerTable() {
    const [ onePlayer , setOnePlayer ] = useState<boolean>(true);
    const [ leftSidePlayer , setLeftSidePlayer ] = useState<PlayerInRoomType[]>([])
    const [ topSidePlayer , setTopSidePlayer] = useState<PlayerInRoomType[]>([])
    const [ bottomSidePlayer , setBottomSidePlayer ] = useState<PlayerInRoomType[]>([])
    const [ rightSidePlayer , setRightSidePlayer ] = useState<PlayerInRoomType[]>([])
    const [reveal,setReveal ] = useRecoilState(isReveal);
    const [ allPlayerInRoom , setAllPlayerInRoom ] = useRecoilState(playersInRoom)
    const [ issueData , setIssueData ] = useRecoilState(issueDataState)
    const [ flipCard , setFlipCard ] = useState<boolean>(false);
    const userData = useRecoilValue(UserData);
    const roomData = useRecoilValue(RoomDataState);
    const [ issueUpdate , setIssueUpdate ] = useRecoilState(issueUpdateState);
    const [ averageVote , setAverageVote ] = useRecoilState(averageVoteState);
    const [ showInvitePopup , setShowInvitePopup ] = useRecoilState(invitePopupState);
    const [ selectedIssueID ,setSelectedIssueID ] = useState<string>('')
    const [ localResetVote , setLocalResetVote ] = useRecoilState(localResetVoteState);
    const [ loading , setLoading ] = useRecoilState(loadingState);
    const stateButtonTime = useRecoilValue(stateButtonTimeState);
    
    useEffect(()=>{
        issueData.forEach((issue)=>{
            if(issue.selected){
                setSelectedIssueID(issue.idFromDB);
            }
        })
        return ()=>setSelectedIssueID('');

    },[issueData])
    
    const { time, start, reset } = useTimer({
        initialTime: 2,
        endTime:0,
        timerType: 'DECREMENTAL',
        onTimeOver: async() => {
            try{
                await directUpdateFirebaseStateReveal(roomData.roomId , 0 , selectedIssueID);
            }catch(err){
                console.log(err);
            } 
        },
    });

    async function countDown(){
        try{
            await directUpdateFirebaseStateReveal(roomData.roomId , 3 , selectedIssueID);
        }catch(err){
            console.log(err);
        }
    }
    
    function TableState(){
        if(reveal === 0){
            return <div className="flex flex-col justify-center items-center rounded-md py-3 px-5 bg-secondary-gray-1 hover:bg-blue-dark cursor-pointer ease-in-out duration-300"
                        onClick={()=>{
                            if(allPlayerInRoom !==null){
                                (async function(){
                                    try{
                                        setLoading(true)
                                        await direactFirebaseResetVote(roomData.roomId);
                                        await directUpdateFirebaseStateReveal(roomData.roomId , 1 ,selectedIssueID)
                                        setLoading(false);
                                        
                                    }catch(err){
                                        console.log(err);
                                    }
                                }())
                            }
                        }}
                    >{loading ? <CircularProgress size={'27px'} style={{color:'white'}} />
                    :<p className="font-bold text-white text-h5 sm:text-p">Start new voting</p>}
                   </div>
        }
        if(reveal === 1){
            setLocalResetVote(false);
            return <div className="flex flex-col justify-center items-center rounded-md py-3 px-5">
                        <p className="font-bold text-white text-p sm:text-h4">Pick your cards!</p>
                    </div>
        }
        if(reveal === 2){
            return  <div className="flex flex-col justify-center items-center rounded-md py-3 px-5 bg-blue-dark hover:bg-blue-dark-op50 cursor-pointer ease-in-out duration-300 "
                        onClick={()=>countDown()}
                    >
                        <p className="font-bold text-white">Reveal Cards</p>
                     </div>
        }
        if(reveal === 3){
            return <div className="flex flex-col justify-center items-center rounded-md py-3 px-5">
                        <p className="font-bold text-blue text-h2">{time}</p>
                    </div>
        }
    }


    function PlayerCard(player:PlayerInRoomType){
        // console.log('checkrerender');
        if(reveal === 1)
            return(
                <div className="w-12 border-2 border-secondary-gray-4 bg-secondary-gray-4 flex justify-center items-center rounded-md" style={{height:'70px'}}>
                            
                </div>
            )
        
        else{
            if(player?.vote !=='-')
                return(
                    <AnimatePresence>
                        {
                         flipCard &&
                         <motion.div className="w-12 border-2 border-blue flex justify-center items-center rounded-md text-blue font-semibold" 
                            animate={{ opacity: 1  ,rotateY:0}}
                            initial={{opacity : 1 , rotateY:0}}
                            exit = {{ opacity : 0  }}
                            transition={{  duration: 0.8 }}
                            style={{height:'70px'}}
                         >
                            {player?.vote}
                         </motion.div>
                        }
                        { reveal !== 0 &&      
                         <motion.div className="w-12 flex justify-center items-center rounded-md border-2 border-blue " 
                            style={{backgroundColor:'#d4f0f7',
                            height:'70px',
                                backgroundImage:player?.profilePicture==='-' ? 'url("/static/images/Poker/mintel.png")': `url(${player?.profilePicture})` , backgroundRepeat:'no-repeat' ,backgroundPosition:'center' ,backgroundSize: player?.profilePicture==='-' ? 'contain' : 'cover',
                            }} 
                            animate={{ opacity: 1  ,rotateY:0 }}
                            initial={{opacity : 0.2 , rotateY:90  }}
                            exit = {{ opacity : 0.2  , rotateY:90 }}
                            transition={{  duration: 0.8 }}
                         >
                        </motion.div>
                        }    
                    </AnimatePresence>
                )
            else{
                return(
                    <div className="w-12 border-2 border-secondary-gray-4 bg-secondary-gray-4 flex justify-center items-center rounded-md" style={{height:'70px'}}>     
                    </div>
                )
            }
        }
    }

    // handle for flip card
    useEffect(()=>{
        if(reveal === 0){
            reset();
            setTimeout(()=>setFlipCard(true), 650);
            
        }
        else
            setFlipCard(false)
        if(reveal === 3){
            start();
            if(stateButtonTime === 2){
                firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                    "isStartVoting" : false,
                    "startVotingAt" : 0,
                    "deleteIssue":'-'
                })
            }
        }
    },[reveal])

    useEffect(()=>{
        //get all player by roomId
        if(allPlayerInRoom !== null){
            let temp_array_bottomSidePlayer = [] as PlayerInRoomType[];
            let temp_array_topSidePlayer = [] as PlayerInRoomType[];
            let temp_array_leftSidePlayer = [] as PlayerInRoomType[];
            let temp_array_rightSidePlayer = [] as PlayerInRoomType[];
            if(allPlayerInRoom?.length === 1)
                setOnePlayer(true)
            if(allPlayerInRoom?.length >= 2)
                setOnePlayer(false)
            for(let index = 0 ; index < allPlayerInRoom.length ; index++){
                if(allPlayerInRoom[index]?.vote !== '-' && reveal === 1){
                    (async function (){      
                        try{
                        await directUpdateFirebaseStateReveal(roomData.roomId , 2 , selectedIssueID);
                        }catch(err){
                            console.log(err);
                        }
                    }())
                }
                if(index % 4 === 0){
                    temp_array_bottomSidePlayer.push(allPlayerInRoom[index]);
                }
                else if(index % 4 === 1){
                    temp_array_topSidePlayer.push(allPlayerInRoom[index]);
                }
                else if(index % 4 === 2){
                    if(temp_array_leftSidePlayer.length >= 6){
                        temp_array_bottomSidePlayer.push(allPlayerInRoom[index]);
                    }
                    else{
                        temp_array_leftSidePlayer.push(allPlayerInRoom[index]);
                    }
                }
                else if(index % 4 === 3){
                    if(temp_array_rightSidePlayer.length >= 6){
                        
                        temp_array_topSidePlayer.push(allPlayerInRoom[index]);
                    }
                    else{
                        temp_array_rightSidePlayer.push(allPlayerInRoom[index]);
                    }
                }  
            }
            setBottomSidePlayer(temp_array_bottomSidePlayer);
            setTopSidePlayer(temp_array_topSidePlayer);
            setLeftSidePlayer(temp_array_leftSidePlayer);
            setRightSidePlayer(temp_array_rightSidePlayer);
        }
        return()=>{
            setTopSidePlayer([]);
            setBottomSidePlayer([]);
            setLeftSidePlayer([]);
            setRightSidePlayer([]);
        }
    },[allPlayerInRoom])
    

    return (
        <div className="w-full h-full flex justify-center items-center" >
            <div className='grid grid-cols-3 gap-y-1 gap-x-2 items-center'>
                {/* left side */}
                    <div className='row-span-3 flex flex-col-reverse flex-wrap-reverse h-[350px] justify-center content-start'>
                        {leftSidePlayer.map((player , index)=>(
                            <div className="flex flex-col items-center justify-center mt-4" key={player?.id}>
                                {PlayerCard(player)}
                                <div className={`flex items-center justify-center font-semibold mt-1 w-16`}>
                                    {player?.isHost &&
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>}
                                    <p className={`font-semibold w-fit overflow-hidden`} style={{maxWidth: player?.isHost ? "48px" : "64px" , whiteSpace:'nowrap'}}>{player?.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                {/* top side*/}
                <div className="flex flex-wrap-reverse justify-around items-start h-fit min-h-[80px] w-40 sm:w-48 md:w-60 lg:w-80 ">
                        { onePlayer ? 
                        <div className='flex flex-col justify-center items-center'>
                            <p className="text-secondary-gray-1 font-semibold">Feeling lonely? 😴</p>
                            <p className="cursor-pointer text-blue font-bold hover:text-primary-blue-2" onClick={()=>setShowInvitePopup(true)}>Invite members</p>
                        </div> : topSidePlayer.map((player , index)=>(
                            <div className="flex flex-col items-center justify-center mr-1 ml-1 mt-3" key={player?.id}>
                                {PlayerCard(player)}
                                <div className={`flex items-center justify-center font-semibold mt-1 w-16`}>
                                    {player?.isHost &&
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>}
                                    <p className={`font-semibold w-fit overflow-hidden`} style={{maxWidth: player?.isHost ? "48px" : "64px" , whiteSpace:'nowrap'}}>{player?.name}</p>
                                </div>
                            </div>
                        ))}
                </div>
                {/* right table */}
                <div className='row-span-3 flex flex-col flex-wrap h-[350px] justify-center content-start'>
                        {rightSidePlayer.map((player , index)=>(
                            <div className="flex flex-col items-center justify-center mt-4" key={player?.id}>
                                {PlayerCard(player)}
                                <div className={`flex items-center justify-center font-semibold mt-1 w-16`}>
                                    {player?.isHost &&
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>}
                                    <p className={`font-semibold w-fit overflow-hidden`} style={{maxWidth: player?.isHost ? "48px" : "64px" ,whiteSpace:'nowrap'}}>{player?.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                {/* table */}
                <div className="flex flex-col justify-center items-center h-28 lg:h-32 w-40 sm:w-48 md:w-60 lg:w-80 bg-primary-blue-2 rounded-3xl relative">
                        {TableState()} 
                        {reveal === 2 && <div className='absolute top-2 right-2'><ResetButton/></div>}
                </div>
                {/* bottom side */}
                <div className="flex flex-wrap justify-around items-start mt-2 h-fit min-h-[80px] w-40 sm:w-48 md:w-60 lg:w-80">
                        {bottomSidePlayer && bottomSidePlayer.map((player , index)=>(
                            <div className="flex flex-col items-center justify-center mr-1 ml-1 mb-3" key={player?.id}>
                                {PlayerCard(player)}
                                <div className={`flex items-center justify-center font-semibold mt-1 w-16`}>
                                    {player?.isHost &&
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>}
                                    <p className={`font-semibold w-fit overflow-hidden`} style={{maxWidth: player?.isHost ? "48px" : "64px" , whiteSpace:'nowrap'}}>{player?.name}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>           
    )
}

export default PokerTable