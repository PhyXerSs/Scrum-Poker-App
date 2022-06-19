import { AnimatePresence , motion } from 'framer-motion';
import React, { useState , useEffect } from 'react'
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { updateAverageVote, updateVotingSystem } from '../../pages/api/PokerAPI/api';
import { averageVoteState, gameSettingClickState, isReveal, issueDataState, issueUpdateState, playersInRoom, RoomDataState, syncVotingSequenceState, UserData, votingSequenceState } from '../../PokerStateManagement/Atom';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import firebase from '../../firebase/firebase-config';
function GameSetting() {
    const [ showGameSetting , setShowGameSetting ] = useRecoilState(gameSettingClickState);
    const [allPlayerInRoom , setAllPlayerInRoom ] = useRecoilState(playersInRoom);
    const reveal = useRecoilValue(isReveal);
    const roomData = useRecoilValue(RoomDataState);
    const [ averageVote , setAverageVote ] = useRecoilState(averageVoteState);
    const [ issueUpdate , setIssueUpdate ] = useRecoilState(issueUpdateState);
    const [ issueData , setIssueData ] = useRecoilState(issueDataState);
    const userData = useRecoilValue(UserData);
    const [ sequenceData , setSequenceData ] = useRecoilState(votingSequenceState);
    const syncVotingSequence = useRecoilValue(syncVotingSequenceState);
    useEffect(()=>{
        if(syncVotingSequence === 'fibo'){
            setSequenceData([ "0" , "0.5" , "1" , "2" , "3" , "5" , "8" ,"13" , "21" , "34" , "40" , "?"]);
        }else if(syncVotingSequence === 'sequential'){
            let i = 0 as number;
            let arraySequence = [] as string[];
            while(i <= 40){
                arraySequence.push(String(i))
                if( i == 0) arraySequence.push(String(0.5));
                if(i==40) arraySequence.push('?');
                i+= 1
            }
            setSequenceData(arraySequence);
        }
    },[syncVotingSequence])

    return (
            <AnimatePresence>
                {showGameSetting &&
                    <motion.div className="h-screen w-full fixed top-0 left-0  flex justify-center items-center z-50 bg-blue-dark-op50 "
                        animate={{ opacity: 1 }}
                        initial={{opacity : 0  }}
                        exit = {{ opacity : 0 }}
                        transition={{  duration: 1 }}
                    >
                            {showGameSetting &&
                            <motion.div className="flex flex-col justify-center items-start w-full max-w-2xl bg-white py-6 px-6 rounded-3xl relative overflow-y-auto"
                                        style={{maxHeight:'530px'}}
                                        animate={{ opacity: 1 , y: 0 }}
                                        initial={{opacity : 0 , y:-150 }}
                                        exit ={{ opacity : 0 , y:-150 }}
                                        transition={{  duration: 0.8 }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 absolute top-2 right-2 p-1 text-secondary-gray-2 rounded-full duration-200 ease-in hover:cursor-pointer hover:bg-secondary-gray-3 hover:text-white " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                            onClick={()=>{setShowGameSetting(false);}}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        
                                        <p className="font-bold text-h3 text-gray mb-8"> Room settings </p>
                                        <div className='flex w-full flex-col justify-center items-start rounded-lg drop-shadow-lg bg-gray-light px-4 '>
                                            <p className ="text-h4 text-secondary-gray-1 font-bold ml-3 mt-5"> Voting system</p>
                                            <div className="flex w-full justify-center">
                                                <FormControl 
                                                sx={{ marginTop:'15px' , marginBottom:'10px' ,width:"95%"  }}
                                                >
                                                    <Select
                                                        
                                                        labelId="demo-simple-select-autowidth-label"
                                                        id="demo-simple-select-autowidth"
                                                        value={syncVotingSequence}
                                                        disabled={reveal === 3 || reveal === 0}
                                                        onChange={async(e)=>{
                                                            try{
                                                                await updateVotingSystem(roomData.roomId , e.target.value);
                                                            }catch(err){
                                                                console.log(err);
                                                            }
                                                        }}
                                                        inputProps={{ 'aria-label': 'Without label' }}
                                                    >
                                                        <MenuItem value={'fibo'}>
                                                            Fibonacci ( 0, 0.5, 1, 2, 3, 5, 8, 13, 21, 34, 40, ? )
                                                        </MenuItem>
                                                        <MenuItem value={'sequential'}>Sequential ( 0 , 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ... , 40, ? )</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </div>
                                        </div>
                                        <div className='flex w-full flex-col justify-center items-start rounded-lg drop-shadow-lg bg-gray-light px-4 mt-8'>
                                            <p className ="text-h4 text-secondary-gray-1 font-bold ml-3 mt-5"> Kick members </p>
                                            <div className ="flex w-full max-w-xl justify-start items-start mt-5 mb-3 overflow-y-auto h-40">
                                                <div className="flex flex-wrap w-full justify-start items-center gap-3">
                                                {allPlayerInRoom?.map((player ,index) =>( index !== 0 && !player?.isHost &&
                                                    <div className={`flex items-center justify-center pl-4 pr-2 py-1 mx-2 mt-1 bg-primary-blue-2 rounded-full drop-shadow-lg gap-2 ${reveal === 3 ? "cursor-not-allowed " : "cursor-pointer"} hover:bg-blue-dark-op50 ease-in duration-200`} key={`${player.id}+${index}`}
                                                        onClick={()=>{
                                                            if( reveal !==3){
                                                                (async function(){
                                                                    try{
                                                                        firebase.database().ref(`poker/status/${player?.id}`).set("offline");
                                                                        firebase.database().ref(`poker/alert_user_event/${roomData.roomId}/success`).set({
                                                                            message:`"${allPlayerInRoom[0].name}"😜 kick "${player?.name}"😭`
                                                                        })
                                                                       
                                                                    }catch(err){
                                                                        console.log(err);     
                                                                    }
                                                                }())       
                                                            }
                                                        }}
                                                    >
                                                        <p className="text-p text-white font-semibold my-0">{player.name}</p>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                ))}
                                                </div>
                                            </div>
                                        </div>     
                                </motion.div>
                            }
                    </motion.div> }
                </AnimatePresence>
    )
}

export default GameSetting