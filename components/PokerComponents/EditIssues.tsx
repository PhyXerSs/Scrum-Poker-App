import { AnimatePresence , motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState , useRecoilValue } from 'recoil';
import { editIssueClickState, editIssueType ,issueDataState,playersInRoom,RoomDataState , stateButtonTimeState, timeBreakdownState, timeVotingState, UserData} from '../../PokerStateManagement/Atom';
import { changeIssueName, updateBreakdownTime, updateVotingTime } from '../../pages/api/PokerAPI/api'
import firebase from '../../firebase/firebase-config';

function EditIssues() {
    const titleRef = useRef<HTMLTextAreaElement>(null)
    const ownerRef = useRef<HTMLInputElement>(null)
    const [ isEditIssueClick , setIsEditIssueClick ] = useRecoilState(editIssueClickState);
    const roomData = useRecoilValue(RoomDataState);
    const issueData = useRecoilValue(issueDataState);
    const timeBreakdown = useRecoilValue(timeBreakdownState);
    const timeVoting = useRecoilValue(timeVotingState); 
    const stateButtonTime  = useRecoilValue(stateButtonTimeState);
    const allPlayerInRoom = useRecoilValue(playersInRoom);
    const [ frontEndBoxDefault , setFrontEndBoxDefault ] = useState<boolean>(false);
    const [ backEndBoxDefault , setBackEndBoxDefault ]  = useState<boolean>(false);
    const [ otherBoxDefault , setOtherBoxDefault ] = useState<boolean>(false);

    const [ issueTypeEdit , setIssueTypeEdit ] = useState<string[]>([])
    function secondsToTime(sec:number){
        var h = Math.floor(sec / 3600).toString().padStart(2,'0'),
        m = Math.floor(sec % 3600 / 60).toString().padStart(2,'0'),
        s = Math.floor(sec % 60).toString().padStart(2,'0');
        return h + ':' + m + ':' + s;
    }

    useEffect(()=>{
        issueData.forEach((issue)=>{
            if(isEditIssueClick.idFromDB === issue.idFromDB){
                let defaultEditIssue = {} as editIssueType;
                defaultEditIssue.id = issue.id;
                defaultEditIssue.idFromDB = issue.idFromDB;
                defaultEditIssue.isEditClick = true;
                defaultEditIssue.score = issue.score;
                defaultEditIssue.title = issue.title;
                defaultEditIssue.selected = issue.selected;
                defaultEditIssue.breakdownTime = issue.breakdownTime;
                defaultEditIssue.ownerName = issue.ownerName;
                defaultEditIssue.votingTime = issue.votingTime;
                defaultEditIssue.issueType = issue.issueType;
                setIsEditIssueClick(defaultEditIssue);  
            }
        })
    },[issueData])


    useEffect(()=>{
        
        setIssueTypeEdit(isEditIssueClick?.issueType);
        if(isEditIssueClick?.issueType?.includes("Front End")){
            setFrontEndBoxDefault(true);
        }
        if(isEditIssueClick?.issueType?.includes("Back End")){
            setBackEndBoxDefault(true);
        }
        if(isEditIssueClick?.issueType?.includes("Other")){
            setOtherBoxDefault(true)
        }
    },[isEditIssueClick])
    
    return (
        <AnimatePresence>
            {isEditIssueClick.isEditClick &&
            <motion.div className="h-screen w-full fixed top-0 left-0  flex justify-center items-center " style={{zIndex:'100'}}
                animate={{ opacity: 1 }}
                initial={{opacity : 0  }}
                exit = {{ opacity : 0 }}
                transition={{  duration: 1 }}
                
            >   {isEditIssueClick.isEditClick &&
                    <motion.div className="flex flex-col justify-center items-start w-full max-w-xl bg-white py-8 px-8 rounded-3xl relative drop-shadow-lg"
                                animate={{ opacity: 1 , y: 0 ,rotateX:0}}
                                initial={{opacity : 0 , y:-150 , rotateX:90}}
                                exit ={{ opacity : 0 ,scale:0 , rotateX:90}}
                                transition={{  duration: 0.7 }}
                                onClick={(e)=>e.stopPropagation()}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 absolute top-2 right-2 p-1 text-secondary-gray-2 rounded-full duration-200 ease-in hover:cursor-pointer hover:bg-secondary-gray-3 hover:text-white " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                    onClick={(e)=>{
                                        let defaultEditIssue = {} as editIssueType;
                                        defaultEditIssue.id = '';
                                        defaultEditIssue.idFromDB = '';
                                        defaultEditIssue.isEditClick = false;
                                        defaultEditIssue.score = '';
                                        defaultEditIssue.title = '';
                                        defaultEditIssue.selected = false;
                                        defaultEditIssue.ownerName = '';
                                        defaultEditIssue.breakdownTime = 0;
                                        defaultEditIssue.votingTime = 0;
                                        defaultEditIssue.issueType = [];
                                        setIsEditIssueClick(defaultEditIssue);

                                        setFrontEndBoxDefault(false);
                                        setBackEndBoxDefault(false);
                                        setOtherBoxDefault(false);
                                    }}
                            >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            
                            <form  className="w-full h-fit" 
                                onSubmit={(e)=>{
                                    (async function(){
                                        try{
                                            if(titleRef.current !== null && ownerRef.current !== null){
                                                if(issueTypeEdit.length > 0){
                                                    await changeIssueName(roomData.roomId , isEditIssueClick.idFromDB , titleRef.current.value , ownerRef.current.value , issueTypeEdit.sort());
                                                }else{
                                                    await changeIssueName(roomData.roomId , isEditIssueClick.idFromDB , titleRef.current.value , ownerRef.current.value , ['Other']);
                                                }
                                                let defaultEditIssue = {} as editIssueType;
                                                defaultEditIssue.id = '';
                                                defaultEditIssue.idFromDB = '';
                                                defaultEditIssue.isEditClick = false;
                                                defaultEditIssue.score = '';
                                                defaultEditIssue.title = '';
                                                defaultEditIssue.selected = false;
                                                defaultEditIssue.ownerName = '';
                                                defaultEditIssue.breakdownTime = 0;
                                                defaultEditIssue.votingTime = 0;
                                                defaultEditIssue.issueType = [];
                                                setIsEditIssueClick(defaultEditIssue);
                                                setFrontEndBoxDefault(false);
                                                setBackEndBoxDefault(false);
                                                setOtherBoxDefault(false);
                                            }
                                        }catch(err){
                                            console.log(err);
                                        }
                                    }())
                                    e.preventDefault();
                                }}
                            >
                                <p className="text-secondary-gray-2 mt-4 mb-2 text-p"> Edit issue title</p>
                                <div className="w-full flex flex-col justify-start items-center bg-secondary-gray-4 rounded-lg mt-2">
                                    <textarea defaultValue={isEditIssueClick.title} ref={titleRef}  style={{resize:'none',minHeight:96 , maxWidth:'480px'}} className="focus:outline-none bg-transparent w-full max-w-md mt-4 mb-4" placeholder='Enter a title for the issue' />
                                </div>
                                <p className="text-secondary-gray-2 mt-4 mb-2 text-p"> Edit issue owner</p>
                                <div className="w-full flex flex-col justify-start items-center bg-secondary-gray-4 rounded-lg mt-2">
                                    <input defaultValue={isEditIssueClick.ownerName} ref={ownerRef}  style={{ maxWidth:'480px'}} className="focus:outline-none bg-transparent w-full max-w-md mt-2 mb-2" placeholder='Enter owner name' />
                                </div>

                                <div className='w-80 flex justify-start items-center gap-3 mt-5'>
                                    <p className=" text-gray font-semibold" style={{fontSize:'14px'}}>Type : </p>
                                    <div className='flex justify-center items-center gap-1'>
                                        <input type="checkbox" className="w-4 h-4" value="Front End" id="FrontEndCheckBox" checked={frontEndBoxDefault}
                                            onChange={(e)=>{
                                                setFrontEndBoxDefault(!frontEndBoxDefault);
                                                if(issueTypeEdit.includes(e.target.value)){
                                                    setIssueTypeEdit(issueTypeEdit?.filter(type=>type!==e.target.value));
                                                }else{
                                                    setIssueTypeEdit([...issueTypeEdit,e.target.value])
                                                }
                                            }}
                                        />
                                        <p className=" text-secondary-gray-2 font-semibold" style={{fontSize:'14px'}}> Front End</p>
                                    </div>
                                    <div className='flex justify-center items-center gap-1'>
                                        <input type="checkbox" className="w-4 h-4" value="Back End" id="BackEndCheckBox" checked={backEndBoxDefault}
                                            onChange={(e)=>{
                                                setBackEndBoxDefault(!backEndBoxDefault);
                                                if(issueTypeEdit.includes(e.target.value)){
                                                    setIssueTypeEdit(issueTypeEdit?.filter(type=>type!==e.target.value));
                                                }else{
                                                    setIssueTypeEdit([...issueTypeEdit,e.target.value])
                                                }
                                            }}
                                        />
                                        <p className="text-secondary-gray-2 font-semibold" style={{fontSize:'14px'}}> Back End</p>
                                    </div>
                                    <div className='flex justify-center items-center gap-1'> 
                                        <input type="checkbox" className="w-4 h-4" value="Other" id="OtherCheckBox" checked={otherBoxDefault}
                                            onChange={(e)=>{
                                                setOtherBoxDefault(!otherBoxDefault)
                                                if(issueTypeEdit.includes(e.target.value)){
                                                    setIssueTypeEdit(issueTypeEdit?.filter(type=>type!==e.target.value));
                                                }else{
                                                    setIssueTypeEdit([...issueTypeEdit,e.target.value])
                                                }
                                            }}
                                        />
                                        <p className="text-secondary-gray-2 font-semibold" style={{fontSize:'14px'}}>Other</p>
                                    </div>
                                </div>

                                <div className="flex mt-3 justify-between items-start w-full">
                                    <div className="flex justify-center items-center gap-1">
                                        <p className="text-secondary-gray-2 mt-4 mb-2 text-p"> Breakdown time :</p>
                                        <div className='flex justify-center items-center bg-secondary-gray-4 rounded-lg mt-2 px-2 py-1 cursor-default'>
                                            <p className=" font-semibold text-secondary-gray-1">{secondsToTime(isEditIssueClick.selected ? timeBreakdown : isEditIssueClick.breakdownTime)}</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue p-1 mt-2 rounded-full cursor-pointer hover:bg-primary-blue-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                            onClick={async()=>{
                                                if(isEditIssueClick.selected){
                                                    if(stateButtonTime === 1){
                                                        firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                                                            "isStartBreakdown" : false,
                                                            "startBreakDownAt" : 0,
                                                            "shouldUpdateToFireStore": false,
                                                            "isResetBreakdownTime":true
                                                        })
                                                    }else{
                                                        firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                                                            "isResetBreakdownTime":true
                                                        })
                                                    }
                                                }
                                                try{
                                                    await updateBreakdownTime(roomData.roomId , isEditIssueClick.idFromDB ,0 );
                                                    if(allPlayerInRoom !== null){
                                                        firebase.database().ref(`poker/alert_user_event/${roomData.roomId}/warning`).set({
                                                            message:`"${allPlayerInRoom[0].name}" reset breakdown time of Issue: "${isEditIssueClick.title}"`
                                                        })
                                                    }
                                                }catch(err){
                                                    console.log(err);
                                                }  
                                            }}
                                        >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        
                                    </div>
                                    <div className="flex justify-center items-start gap-1">
                                        <p className="text-secondary-gray-2 mt-4 mb-2 text-p"> Voting time :</p>
                                        <div className='flex justify-center items-center bg-secondary-gray-4 rounded-lg mt-2 px-2 py-1 cursor-default'>
                                            <p className=" font-semibold text-secondary-gray-1">{secondsToTime(isEditIssueClick.selected ? timeVoting : isEditIssueClick.votingTime)}</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue p-1 mt-2 rounded-full cursor-pointer hover:bg-primary-blue-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                            onClick={async()=>{
                                                if(isEditIssueClick.selected){
                                                    if(stateButtonTime === 2){
                                                        firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                                                            "isStartVoting" : false,
                                                            "startVotingAt" : 0,
                                                            "shouldUpdateToFireStore": false,
                                                            "isResetVotingTime":true
                                                        })
                                                    }else{
                                                        firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                                                            "isResetVotingTime":true
                                                        })
                                                    }
                                                }
                                                try{
                                                    await updateVotingTime(roomData.roomId,isEditIssueClick.idFromDB,0);
                                                    if(allPlayerInRoom !== null){
                                                        firebase.database().ref(`poker/alert_user_event/${roomData.roomId}/warning`).set({
                                                            message:`"${allPlayerInRoom[0].name}" reset voting time of Issue: "${isEditIssueClick.title}"`
                                                        })
                                                    }
                                                }catch(err){
                                                    console.log(err);
                                                    
                                                }    
                                            }}
                                        >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                </div>
                                <button type="submit" className="w-full flex justify-center items-center drop-shadow-lg bg-blue hover:cursor-pointer hover:bg-primary-blue-2 duration-200 ease-in text-white font-bold py-2 rounded-md mt-6">
                                    Confirm
                                </button>
                            </form>
                    </motion.div>}
            </motion.div>}
        </AnimatePresence>
    )
}

export default EditIssues