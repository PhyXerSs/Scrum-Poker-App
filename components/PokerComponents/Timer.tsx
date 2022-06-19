import React, { useState , useEffect, useRef } from 'react'
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import { Popover , Transition } from '@headlessui/react'
import TextField from '@mui/material/TextField';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useRecoilValue } from 'recoil';
import { countdownState, RoomDataState, UserData } from '../../PokerStateManagement/Atom';
import firebase from '../../firebase/firebase-config';
import * as firebaseServer from 'firebase';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';

function Timer() {
    const [ isTimerStart , setIsTimerStart ] = useState<boolean>(false);
    const [ initialCount , setInitialCount ] = useState<string>('1');
    const [ nowCountDown , setNowCountdown ] = useState<number>(-1);
    const countDown = useRecoilValue(countdownState);
    const roomData = useRecoilValue(RoomDataState);
    const userData = useRecoilValue(UserData);
    const [ pauseSnapTime , setPauseSnapTime ] = useState<number>(0);
    const [ startSnapTime , setStartSnapTime ] = useState<number>(0);
    const hoverTimerRef = useRef(null)
    const [ isHoverTimer , setIsHoverTimer ] = useState<boolean>(false);
    const [ isShowTimeup , setIsShowTimeUp ] = useState<boolean>(false);
    const [ isPaused , setIsPause ] = useState<boolean>(false);
    useEffect(()=>{
        let interval:NodeJS.Timer;
        let serverTimeOffset = 0;
        firebase.database().ref(".info/serverTimeOffset").on("value", (snapshot) => { serverTimeOffset = snapshot.val() });
        firebase.database().ref(`poker/countdown/${roomData.roomId}`).on("value", (snapshot) => {
                if(snapshot.val() !== null){
                    clearInterval(interval);
                    let startAt = snapshot.val()?.startAt;
                    let seconds = snapshot.val()?.seconds;
                    let pauseAt = snapshot.val()?.pauseAt;
                    let initialcount = snapshot.val()?.initialCount
                    setStartSnapTime(startAt);
                    setPauseSnapTime(pauseAt);
                    setInitialCount(String(initialcount));
                    
                    if(pauseAt !== 0){
                        let timeLeft = (seconds * 1000) - (pauseAt - startAt);
                        setNowCountdown(timeLeft / 1000);
                        setIsPause(true);
                    }else{
                        setIsPause(false);
                        setIsShowTimeUp(false)
                        interval = setInterval(() => {
                            let timeLeft = (seconds * 1000) - (Date.now() - startAt + serverTimeOffset);
                            
                            if (timeLeft < 0) {
                                clearInterval(interval);
                                setInitialCount('1');
                                setNowCountdown(timeLeft / 1000);
                                setIsShowTimeUp(true);
                                setTimeout(()=>{setIsShowTimeUp(false)},5000)
                            }
                            else {
                                setNowCountdown(timeLeft / 1000);
                            }
                        }, 300)
                    }
                    
                }
        });
        return ()=>{
            firebase.database().ref(".info/serverTimeOffset").off();
            firebase.database().ref(`poker/countdown/${roomData.roomId}`).off();
            setNowCountdown(0);
            setInitialCount('1');
            clearInterval(interval);
        }
    },[roomData])
    
    function colorStroke(val : number){
        if(val> 25)
            return '#6BCB77'
        return '#d16642'
    }

    function secondsToTime(sec:number){
        var m = Math.floor(sec % 3600 / 60).toString().padStart(2,'0'),
        s = Math.floor(sec % 60).toString().padStart(2,'0');
        return m + ':' + s;    
    }   

    return (
        <div className="absolute left-5 top-32 flex justify-center items-center w-fit" style={{zIndex:2}}>
            {isHoverTimer&& nowCountDown > 0  && 
                <div className="absolute left-20 top-7 bg-gray px-2 py-1 flex w-14 justify-center items-center rounded-lg drop-shadow-md">
                    <p className="font-semibold text-white">{secondsToTime(nowCountDown)}</p>
                </div>
            }
            {isShowTimeup &&
                <div className="absolute left-20 top-5 px-2 py-3 flex w-40 justify-around items-center rounded-lg" style={{backgroundColor:'#E60965'}}>
                    <p className="text-white text-h4">Time is up!</p>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        onClick={()=>setIsShowTimeUp(false)}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            }
            {nowCountDown > 0 ?
                <Popover >
                    <Popover.Button className='w-14 rounded-full absolute left-4 top-4 bg-primary-blue-3 drop-shadow-lg' 
                        onMouseEnter={()=>setIsHoverTimer(true)}
                        onMouseLeave={()=>setIsHoverTimer(false)}
                    >
                        <svg className="-rotate-90 relative " viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="32" stroke={colorStroke(nowCountDown*100/(Number(initialCount)))} fill='rgb(232 243 255 / var(--tw-bg-opacity))' strokeWidth={15}
                                    style={{
                                        strokeDasharray: `${nowCountDown*100/(Number(initialCount)) *2} 200`,  
                                    }}
                                />
                        </svg>
                        {isPaused &&
                        <PauseCircleFilledIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-blue-2 hover:text-tertiary-light-sky-blue" />}
                    </Popover.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Popover.Panel className="z-10 absolute w-44 flex flex-col items-center left-4 top-20 bg-white rounded-lg drop-shadow-md">
                            {pauseSnapTime > 0 ? 
                            <Popover.Button className='flex justify-start items-center w-full rounded-t-lg  gap-3 py-3 px-2 hover:bg-primary-blue-3 cursor-pointer'
                                onClick={()=>{
                                    firebase.database().ref(`poker/countdown/${roomData.roomId}`).update({
                                        seconds:nowCountDown, 
                                        startAt:firebaseServer.database.ServerValue.TIMESTAMP,
                                        pauseAt:0,
                                    })
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-gray-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="font-semibold text-secondary-gray-1">Resume</p>
                            </Popover.Button>    
                            
                            :
                            <Popover.Button className='flex justify-start items-center w-full rounded-t-lg  gap-3 py-3 px-2 hover:bg-primary-blue-3 cursor-pointer'
                                onClick={()=>{
                                    firebase.database().ref(`poker/countdown/${roomData.roomId}`).update({
                                        pauseAt:firebaseServer.database.ServerValue.TIMESTAMP,
                                    })
                                }}
                            >
                                
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-gray-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="font-semibold text-secondary-gray-1">Pause</p>
                            </Popover.Button>}
                            <Popover.Button className='flex justify-start items-center w-full rounded-b-lg gap-3 py-3 px-2 hover:bg-primary-blue-3 cursor-pointer'
                                onClick={()=>{
                                    firebase.database().ref(`poker/countdown/${roomData.roomId}`).update({
                                        seconds:0, 
                                        startAt:0,
                                        pauseAt:0,
                                        initialCount:0,
                                    })
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-gray-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                </svg>
                                <p className="font-semibold text-secondary-gray-1">Stop</p>
                            </Popover.Button>   

                        </Popover.Panel>
                    </Transition>           
                </Popover>            
            :
            <Popover className=" absolute left-4 top-4">
                <Popover.Button className=" outline-none w-14 h-14 bg-blue-light rounded-full text-primary-blue-2 hover:bg-primary-blue-3 hover:text-tertiary-light-sky-blue drop-shadow-lg">
                    <AccessAlarmsIcon fontSize='large'/>
                </Popover.Button>
                <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                >
                    <Popover.Panel className="z-10 absolute w-52 flex flex-col items-center left-0 top-2 bg-white rounded-lg drop-shadow-md">
                        
                        <TextField type={'number'} value={initialCount} variant="outlined" label="Minutes" size={'small'} style={{ width:'170px' , marginTop:'25px' }}
                            onChange={(e)=>{
                                if (Number(e.target.value) > 1000) {
                                    setInitialCount('1000');
                                } else if (Number(e.target.value) < 0) {
                                    setInitialCount('0');
                                } else {
                                    setInitialCount(`${Number(e.target.value)}`);
                                }
                            }}
                            
                            onKeyPress={(e)=>{
                                if(e.key ==='Enter'){
                                    if(initialCount !== '' && Math.sign(Number(initialCount)) > 0){
                                        firebase.database().ref(`poker/countdown/${roomData.roomId}`).set({
                                            startAt: firebaseServer.database.ServerValue.TIMESTAMP,
                                            seconds: Number(initialCount)*60,
                                            pauseAt: 0,
                                            initialCount:Number(initialCount)*60,
                                        })
                                    }
                                }
                            }}
                        
                        />
                        <Popover.Button className="flex justify-center items-center bg-primary-blue-1  rounded-md py-1 mt-5 mb-5 cursor-pointer duration-150 ease-in hover:bg-primary-blue-2 gap-2" style={{width:'170px'}}
                            onClick={()=>{
                                if(initialCount !== '' && Math.sign(Number(initialCount)) > 0){
                                    firebase.database().ref(`poker/countdown/${roomData.roomId}`).set({
                                        startAt: firebaseServer.database.ServerValue.TIMESTAMP,
                                        seconds: Number(initialCount)*60,
                                        pauseAt: 0,
                                        initialCount:Number(initialCount)*60,
                                    })
                                }
                            }}
                        >
                            <PlayArrowIcon style={{color:'white'}}/>
                            <p className='text-white font-semibold py-1 mr-2'>Start</p>
                        </Popover.Button>
                    </Popover.Panel>
                </Transition>
            </Popover>
            }

        </div>
  )
}

export default Timer