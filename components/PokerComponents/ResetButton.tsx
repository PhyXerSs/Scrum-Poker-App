import { ToggleButton } from '@mui/material'
import React, { useState, Fragment, ReactChild, useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { loadingState, isReveal, issueDataState, issueSelectedState, issueType, issueUpdateState, playersInRoom, RoomDataState, stateButtonTimeState, timeBreakdownState, timeVotingState, UserData } from '../../PokerStateManagement/Atom'
import { createIssue, deleteIssue, startBreakdown, startVoting, stopBreakdown, stopVoting, updateBreakdownTime, updateBreakdownTimeAndVotingTime, updateIssue, updateVotingTime } from '../../pages/api/PokerAPI/api'
import { direactFirebaseResetVote, directUpdateFirebaseStateReveal, resetVote, updateAverageVote, updateStateReveal } from '../../pages/api/PokerAPI/api';

function ResetButton() {
    const [reveal, setReveal] = useRecoilState(isReveal);
    const [loading, setLoading] = useRecoilState(loadingState);
    const roomData = useRecoilValue(RoomDataState);
    const [ isHover , setIsHover ] = useState<boolean>(false)
    return (
        <button className={`flex flex-col w-fit h-fit justify-center items-center text-h5 text-white rounded-full ease-in duration-200 relative`} style={{ backgroundColor: isHover ? 'rgb(135 181 231 / var(--tw-bg-opacity)' :'#eaf2fb' }}
            onClick={(e) => {
                e.stopPropagation()
                if (reveal === 2) {
                    (async function(){
                        try{
                            await direactFirebaseResetVote(roomData.roomId);
                            await directUpdateFirebaseStateReveal(roomData.roomId , 1 ,roomData.roomId)
                        
                        }catch(err){
                            console.log(err);
                        }
                    }())
                }
            }}
            onMouseEnter={()=>setIsHover(true)}
            onMouseLeave={()=>setIsHover(false)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7 text-blue p-1 rounded-full cursor-pointer hover:text-white ease-in duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {isHover && <div className='absolute bg-blue-dark-op50 top-[2px] -left-[84px] rounded-xl w-20 flex justify-center items-center px-1 py-1' >
                <p className="text-white font-semibold">Reset vote</p>
            </div>}
        </button>
    )

}

export default ResetButton