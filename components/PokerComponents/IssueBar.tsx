import React, { useEffect, useRef, useState ,Fragment, ReactChild } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { editIssueClickState, editIssueType, isReveal, issueBarState, issueDataState, issueType, issueUpdateState, maxBackEndPointState, maxFrontEndPointState, maxOtherPointState, playersInRoom, RoomDataState, stateButtonTimeState, timeBreakdownState, timeVotingState } from '../../PokerStateManagement/Atom'
import { motion , AnimatePresence} from 'framer-motion'
import { Menu, Transition , Popover } from '@headlessui/react'
import { DragDropContext , Droppable , Draggable} from 'react-beautiful-dnd';
import { createIssue, deleteIssue, stopBreakdown, stopVoting, updateBreakdownTime, updateIssue, updateMaxBackEndPoint, updateMaxFrontEndPoint, updateMaxOtherPoint, updateVotingTime ,updateIssueScore } from '../../pages/api/PokerAPI/api'
import Linkify from 'react-linkify';
import { Anchorme, LinkComponentProps } from 'react-anchorme'
import { CSVLink } from "react-csv";
import firebase from '../../firebase/firebase-config'
import FilterListIcon from '@mui/icons-material/FilterList';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import TextField from "@mui/material/TextField";
export interface csvHeaderType{
    label:string,
    key:string,
}

export interface csvDataType{
    owner:string,
    issue:string,
    average_points:string,
    breakdown_time:string,
    voting_time:string,
    issue_type:string[],
}

export const csvHeader = [
    { label: "Owner Name", key: "owner" },
    {label: "Issue", key: "issue"},
    {label: "Average Points", key: "average_points"},
    {label:"Breakdown Time", key:"breakdown_time"},
    {label:"Voting Time", key:"voting_time"},
    {label:"Issue Type", key:"issue_type"}
]

function IssueBar() {
    
    const [ issueState , setIssueState ] = useRecoilState(issueBarState);
    const [ issueData , setIssueData ] = useRecoilState<issueType[]>(issueDataState);
    const [ issueUpdate  , setIssueUpdate] = useRecoilState(issueUpdateState);
    const [ countIssuePoint , setCounIssuePoint ] = useState<number>(0);  
    const [ addIssueClick , setAddIssueClick ] = useState<boolean>(false);
    const addIssueRef = useRef<HTMLTextAreaElement>(null);
    const addOwnerIssueRef = useRef<HTMLInputElement>(null);
    const [ showOptionInEachIssue , setShowOptionInEachIssue ] = useState<number>(-1);
    const roomData = useRecoilValue(RoomDataState);
    const reveal = useRecoilValue(isReveal);
    const [ isEditIssueClick , setIsEditIssueClick ] = useRecoilState(editIssueClickState);
    const [ searchText , setSearchText ] = useState<string>('');
    const [ showSearchResult , setShowSearchResult ] = useState<boolean>(false);
    const [ searchResult , setSearchResult ] = useState<issueType[]>([]);
    const [stateButtonTime , setStateButtonTime] = useRecoilState(stateButtonTimeState);
    const timeBreakdown = useRecoilValue(timeBreakdownState);
    const timeVoting = useRecoilValue(timeVotingState);
    const allPlayerInRoom = useRecoilValue(playersInRoom);
    const [ csvData , setCsvData ] = useState<csvDataType[]>([]);
    const [ issueTypes , setIssueTypes ] = useState<string[]>([]);
    const [ filterIssue , setFilterIssue ] = useState<string[]>([]);
    const [ frontEndFilterBoxDefault , setFrontEndFilterBoxDefault ] = useState<boolean>(false);
    const [ backEndFilterBoxDefault , setBackEndFilterBoxDefault ]  = useState<boolean>(false);
    const [ otherFilterBoxDefault , setOtherFilterBoxDefault ] = useState<boolean>(false);
    const [ maxFrontEndPoint , setMaxFrontEndPoint ] = useRecoilState(maxFrontEndPointState)
    const [ maxBackEndPoint , setMaxBackEndPoint ] = useRecoilState(maxBackEndPointState); 
    const [ maxOtherPoint , setMaxOtherPoint ] = useRecoilState(maxOtherPointState);
    const [ remainFrontEndPoint , setRemainFrontEndPoint ] = useState<number>(0)
    const [ remainBackEndPoint , setRemainBackendPoint ] = useState<number>(0);
    const [ remainOtherPoint , setRemainOtherPoint ] = useState<number>(0);
    const [ editMaxFrontEnd , setEditMaxFrontEnd ] = useState<string>('0');
    const [ editMaxBackEnd , setEditMaxBackEnd ] = useState<string>('0')
    const [ editMaxOther, setEditMaxOther ] = useState<string>('0')
    const [ editIssueScore , setEditIssueScore ] = useState<string>('0')

    useEffect(()=>{ 
        let countPoint = 0;
        let allCsvData = [] as csvDataType[];
        issueData.forEach((data)=>{
            let eachCsvData = {} as csvDataType;
            eachCsvData.owner = data.ownerName;
            eachCsvData.issue = data.title;
            eachCsvData.average_points = data.score;
            eachCsvData.breakdown_time = secondsToTime(data.breakdownTime);
            eachCsvData.voting_time = secondsToTime(data.votingTime);
            eachCsvData.issue_type = data.issueType;
            allCsvData.push(eachCsvData);
            if(data.score !== '-'){
                countPoint += Number(data.score);
            }
        })
        setCounIssuePoint(countPoint);
        setCsvData(allCsvData);
    
        //สำหรับการ updateและdelete issue
        if(issueUpdate === 1){
            (async function(){
                try{
                    let sendDataIssue = new Map<string, issueType>();                    
                    issueData.forEach((issue)=>{
                        let issueKey = issue.idFromDB as string;
                        let issueValue ={} as issueType;
                        issueValue.id = issue.id;
                        issueValue.score = issue.score;
                        issueValue.selected = issue.selected;
                        issueValue.title = issue.title;
                        issueValue.ownerName  = issue.ownerName;
                        issueValue.breakdownTime = issue.breakdownTime;
                        issueValue.votingTime = issue.votingTime;
                        issueValue.issueType = issue.issueType;
                        sendDataIssue.set(issueKey ,issueValue);
                    })
                    setIssueUpdate(0);
                    let res = await updateIssue(roomData.roomId , sendDataIssue);

                }catch(err){
                    console.log(err);
                    setIssueUpdate(0);
                }
            }())
        }
        return ()=> setShowOptionInEachIssue(-1);
    },[issueData]) 

    //filter search
    useEffect(()=>{
        if(filterIssue.length > 0 ){
            // console.log(filterIssue);
            let result = issueData?.filter((issue)=>filterIssue.every(element=>(issue.issueType.indexOf(element) > -1))).filter((issue)=>issue.title.includes(searchText))
            setSearchResult(result);
        }else{
            let result = issueData?.filter((issue)=>issue.title.includes(searchText))
            setSearchResult(result);
        }
        
    },[searchText,issueData,filterIssue])

    //calculate remaining points
    useEffect(()=>{
        let remainFrontEnd = Number(maxFrontEndPoint) as number;
        let remainBackEnd = Number(maxBackEndPoint) as number;
        let remainOther = Number(maxOtherPoint) as number;
        issueData.forEach((issue)=>{
            if(issue.score !== '-'){
                if(issue.issueType.includes('Front End')){
                    remainFrontEnd = remainFrontEnd - Number(issue.score);
                }
                if(issue.issueType.includes('Back End')){
                    remainBackEnd = remainBackEnd - Number(issue.score);
                }
                if(issue.issueType.includes('Other')){
                    remainOther = remainOther  - Number(issue.score);
                }
            }
        })
        setRemainFrontEndPoint(remainFrontEnd);
        setRemainBackendPoint(remainBackEnd);
        setRemainOtherPoint(remainOther);

    },[maxFrontEndPoint , maxBackEndPoint , maxOtherPoint ,issueData])


    function getIssueId():string{
        let idArray = [] as number[];
        let max = 0 as number;
        issueData.forEach((data)=>{
            if(Number(data.id) > max)
                max = Number(data.id);
            idArray.push(Number(data.id));     
        })
        for(let i = 0 ; i <= max  ; i++){
            if(!idArray.includes(i)){
                return String(i);
            }
        }
        return `${max+1}`;
    }

    const reorder = (list:any[], startIndex:number, endIndex:number) => {
        setIssueUpdate(1);
        let result = Array.from(list);
        let [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
      };
 
    function classNames(...classes : string[]) {
        return classes.filter(Boolean).join(' ')
      }

    function TextVoteButton(data: issueType){
        if(data.score ==='-' && !data.selected)
            return 'Vote this issue'
        if(data.selected)
            return 'Voting now...'
        else
            return 'Vote agian'
    }

    const CustomLink = (props: LinkComponentProps) => {
        return (
            <a className="text-blue" {...props} />
        )
      }

    function secondsToTime(sec:number){
        var h = Math.floor(sec / 3600).toString().padStart(2,'0'),
        m = Math.floor(sec % 3600 / 60).toString().padStart(2,'0'),
        s = Math.floor(sec % 60).toString().padStart(2,'0');
        return h + ':' + m + ':' + s;
    }

    return (
                <AnimatePresence>
                    { issueState &&
                    <motion.div  className="w-full h-full fixed top-0 z-10 bg-black-opa80 flex justify-end items-center" 
                        animate={{ opacity: 1 }}
                        initial={{opacity : 0  }}
                        exit = {{ opacity : 0  }}
                        transition={{  duration: 0.7 }}
                        onClick={()=>{setIssueState(false);setShowOptionInEachIssue(-1);}}
                    >
                            {issueState &&
                            <motion.div id="issueDiv" className="bg-white h-full flex flex-col justify-start items-center w-96 relative overflow-y-scroll"
                                animate={{ opacity: 1 , x: 0 }}
                                initial={{opacity : 1 , x:300 }}
                                exit = {{ opacity : 0 , x:300}}
                                transition={{  duration: 0.5 }}
                                onClick={(e)=>e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center pt-5 pb-3 fixed top-0 bg-white z-30" style={{width:360}}>
                                    <div className="flex flex-col items-start gap-2 ml-5 justify-center w-full">
                                        <p className="font-bold text-h4 text-secondary-gray-1">Issues</p>
                                        <p className="font-bold text-h5 text-secondary-gray-3">{issueData.length} issues | Total {countIssuePoint} points</p>
                                        <div className='flex justify-start items-center font-bold text-h5 text-secondary-gray-3 gap-[4px]'>
                                            <p> Front End</p>
                                            <p>:</p>
                                            <Popover>
                                                <Popover.Button className='flex w-[84px] justify-center items-center font-bold text-h5 text-secondary-gray-3 hover:text-blue gap-[2px]'>
                                                    <p> Max {maxFrontEndPoint}</p>
                                                    <ModeEditIcon fontSize='small'/>
                                                </Popover.Button>
                                                <Transition
                                                    enter="transition duration-100 ease-out"
                                                    enterFrom="transform scale-95 opacity-0"
                                                    enterTo="transform scale-100 opacity-100"
                                                    leave="transition duration-75 ease-out"
                                                    leaveFrom="transform scale-100 opacity-100"
                                                    leaveTo="transform scale-95 opacity-0"
                                                >
                                                    <Popover.Panel className="absolute w-45 px-3 py-3 flex flex-col items-center -right-10 top-0 bg-white rounded-lg drop-shadow-md" >
                                                    
                                                        <TextField type={'number'} value={editMaxFrontEnd} variant="outlined" label="Front End Points" size={'small'}
                                                            onChange={(e)=>{
                                                                if (Number(e.target.value) > 1000) {
                                                                    setEditMaxFrontEnd('1000');
                                                                } else if (Number(e.target.value) < 0) {
                                                                    setEditMaxFrontEnd('0');
                                                                } else {
                                                                    setEditMaxFrontEnd(`${Number(e.target.value)}`);
                                                                }
                                                            }}
                                                        />
                                                        <Popover.Button className="flex justify-center items-center w-36 bg-primary-blue-1  rounded-md py-1 mt-2 cursor-pointer duration-150 ease-in hover:bg-primary-blue-2 gap-2"
                                                            onClick={async()=>{
                                                                await updateMaxFrontEndPoint(roomData.roomId , editMaxFrontEnd );
                                                            }}
                                                        >
                                                            <p className='text-white font-semibold py-1 mr-2'>Confirm</p>
                                                        </Popover.Button>
                                                    </Popover.Panel>
                                                </Transition>
                                            </Popover>
                                            <p> Remaining {remainFrontEndPoint.toFixed(1)}</p>
                                        </div>
                                        <div className='flex justify-start items-center font-bold text-h5 text-secondary-gray-3 gap-[4px]'>
                                            <p> Back End</p>
                                            <p className="ml-1">:</p>
                                            <Popover>
                                                <Popover.Button className='flex w-[84px] justify-center items-center font-bold text-h5 text-secondary-gray-3 hover:text-blue gap-[2px]'>
                                                    <p> Max {maxBackEndPoint}</p>
                                                    <ModeEditIcon fontSize='small'/>
                                                </Popover.Button>
                                                <Transition
                                                    enter="transition duration-100 ease-out"
                                                    enterFrom="transform scale-95 opacity-0"
                                                    enterTo="transform scale-100 opacity-100"
                                                    leave="transition duration-75 ease-out"
                                                    leaveFrom="transform scale-100 opacity-100"
                                                    leaveTo="transform scale-95 opacity-0"
                                                >
                                                    <Popover.Panel className="absolute w-45 px-3 py-3 flex flex-col items-center -right-10 top-0 bg-white rounded-lg drop-shadow-md" >
                                                        <TextField type={'number'} value={editMaxBackEnd} variant="outlined" label="Back End Points" size={'small'}
                                                            onChange={(e)=>{
                                                                if (Number(e.target.value) > 1000) {
                                                                    setEditMaxBackEnd('1000');
                                                                } else if (Number(e.target.value) < 0) {
                                                                    setEditMaxBackEnd('0');
                                                                } else {
                                                                    setEditMaxBackEnd(`${Number(e.target.value)}`);
                                                                }
                                                            }}
                                                        />
                                                        <Popover.Button className="flex justify-center items-center w-36 bg-primary-blue-1  rounded-md py-1 mt-2 cursor-pointer duration-150 ease-in hover:bg-primary-blue-2 gap-2"
                                                            onClick={async()=>{
                                                                await updateMaxBackEndPoint(roomData.roomId , editMaxBackEnd );
                                                            }}
                                                        >
                                                            <p className='text-white font-semibold py-1 mr-2'>Confirm</p>
                                                        </Popover.Button>
                                                    </Popover.Panel>
                                                </Transition>
                                            </Popover>
                                            <p> Remaining {remainBackEndPoint.toFixed(1)}</p>
                                        </div>
                                        <div className='flex justify-start items-center font-bold text-h5 text-secondary-gray-3 gap-[4px]'>
                                            <p> Other</p>
                                            <p className="ml-6">:</p>
                                            <Popover>
                                                <Popover.Button className='flex w-[84px] justify-center items-center font-bold text-h5 text-secondary-gray-3 hover:text-blue gap-[2px]'>
                                                    <p> Max {maxOtherPoint}</p>
                                                    <ModeEditIcon fontSize='small'/>
                                                </Popover.Button>
                                                <Transition
                                                    enter="transition duration-100 ease-out"
                                                    enterFrom="transform scale-95 opacity-0"
                                                    enterTo="transform scale-100 opacity-100"
                                                    leave="transition duration-75 ease-out"
                                                    leaveFrom="transform scale-100 opacity-100"
                                                    leaveTo="transform scale-95 opacity-0"
                                                >
                                                    <Popover.Panel className="absolute w-45 px-3 py-3 flex flex-col items-center -right-10 top-0 bg-white rounded-lg drop-shadow-md" >
                                                        <TextField type={'number'} value={editMaxOther} variant="outlined" label="Other Points" size={'small'}
                                                            onChange={(e)=>{
                                                                if (Number(e.target.value) > 1000) {
                                                                    setEditMaxOther('1000');
                                                                } else if (Number(e.target.value) < 0) {
                                                                    setEditMaxOther('0');
                                                                } else {
                                                                    setEditMaxOther(`${Number(e.target.value)}`);
                                                                }
                                                            }}
                                                        />
                                                        <Popover.Button className="flex justify-center items-center w-36 bg-primary-blue-1  rounded-md py-1 mt-2 cursor-pointer duration-150 ease-in hover:bg-primary-blue-2 gap-2"
                                                            onClick={async()=>{
                                                                await updateMaxOtherPoint(roomData.roomId , editMaxOther );
                                                            }}
                                                        >
                                                            <p className='text-white font-semibold py-1 mr-2'>Confirm</p>
                                                        </Popover.Button>
                                                    </Popover.Panel>
                                                </Transition>
                                            </Popover>
                                            <p> Remaining {remainOtherPoint.toFixed(1)}</p>
                                        </div>
                                    </div>
                                    <div className=" absolute top-4 right-0 flex justify-center items-center divide-x divide-secondary-gray-2 ">
                                        <Popover>
                                            <Popover.Button>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 mr-2 text-blue p-2 hover:bg-primary-blue-3 rounded-full ease-in-out duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            </Popover.Button>
                                            <Transition
                                                enter="transition duration-100 ease-out"
                                                enterFrom="transform scale-95 opacity-0"
                                                enterTo="transform scale-100 opacity-100"
                                                leave="transition duration-75 ease-out"
                                                leaveFrom="transform scale-100 opacity-100"
                                                leaveTo="transform scale-95 opacity-0"
                                            >
                                                <Popover.Panel className="absolute w-44 flex flex-col items-center right-4 top-0 bg-white rounded-lg drop-shadow-md" >
                                                    <Popover.Button  className="flex justify-start items-center w-full  gap-3 py-3 px-4 rounded-lg hover:bg-primary-blue-3 cursor-pointer">
                                                        <CSVLink data={csvData} headers={csvHeader} filename={`issues_${roomData.roomname}.csv`}>
                                                            <p className="text-gray">Export issues as CSV</p>
                                                        </CSVLink>
                                                    </Popover.Button>
                                                </Popover.Panel>
                                            </Transition>
                                        </Popover>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 ml-2  text-secondary-gray-1 p-2 hover:bg-secondary-gray-4 rounded-full cursor-pointer ease-in-out duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                                onClick={()=>{setIssueState(false);setShowOptionInEachIssue(-1);}}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className={`fixed z-20 pt-1 pb-2 flex justify-center items-center bg-white gap-1`} style={{width:'360px',top:'160px'}}>
                                    <div className='flex justify-between items-center w-72 rounded-full border-2 border-blue drop-shadow-md py-1 px-2 bg-white'>
                                        <input className="outline-none w-4/5 ml-2 bg-transparent text-blue-dark" placeholder="Search issues" type="text" value={searchText} onChange={(e)=>{setSearchText(e.target.value)}} onClick={()=>setShowSearchResult(true)}/>
                                        {searchText !== '' && 
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-gray-2 cursor-pointer mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                            onClick={()=>{
                                                setShowSearchResult(false);
                                                setSearchText('');
                                            }}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 rounded-full text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        
                                    </div>
                                    <Popover>
                                        <Popover.Button className="p-1 rounded-full cursor-pointer hover:bg-primary-blue-3 z-[10]">
                                            <FilterListIcon className="text-blue "/>
                                        </Popover.Button>
                                        <Transition
                                                enter="transition duration-100 ease-out"
                                                enterFrom="transform scale-95 opacity-0"
                                                enterTo="transform scale-100 opacity-100"
                                                leave="transition duration-75 ease-out"
                                                leaveFrom="transform scale-100 opacity-100"
                                                leaveTo="transform scale-95 opacity-0"
                                            >
                                   
                                            <Popover.Panel className=' absolute -bottom-[150px] right-[10px] flex flex-col items-start justify-start w-40 py-3 px-5 rounded-lg bg-white drop-shadow-lg'>
                                                <p className=" text-primary-blue-1 font-semibold">Filter</p>
                                                
                                                <div className="flex flex-col items-start justify-start mt-2">
                                                    <p className=" text-gray font-semibold mb-1" style={{fontSize:'14px'}}>Issue Type</p>
                                                    <div className='flex justify-center items-center gap-2'>
                                                        <input type="checkbox" className="w-4 h-4" value="Front End" checked={frontEndFilterBoxDefault}
                                                            onChange={(e)=>{
                                                                setFrontEndFilterBoxDefault(!frontEndFilterBoxDefault);
                                                                if(filterIssue.includes(e.target.value)){
                                                                    setFilterIssue(filterIssue.filter(type=>type!==e.target.value));
                                                                }else{
                                                                    setFilterIssue([...filterIssue,e.target.value])
                                                                }
                                                            }}
                                                        />
                                                        <p className="text-gray" style={{fontSize:'14px'}}> Front End</p>
                                                    </div>
                                                    <div className='flex justify-center items-center gap-2'>
                                                        <input type="checkbox" className="w-4 h-4" value="Back End" checked={backEndFilterBoxDefault}
                                                            onChange={(e)=>{
                                                                setBackEndFilterBoxDefault(!backEndFilterBoxDefault)
                                                                if(filterIssue.includes(e.target.value)){
                                                                    setFilterIssue(filterIssue.filter(type=>type!==e.target.value));
                                                                }else{
                                                                    setFilterIssue([...filterIssue,e.target.value])
                                                                }
                                                            }}
                                                        />
                                                        <p className="text-gray" style={{fontSize:'14px'}}> Back End</p>
                                                    </div>
                                                    <div className='flex justify-center items-center gap-2'>
                                                        <input type="checkbox" className="w-4 h-4" value="Other" checked={otherFilterBoxDefault}
                                                            onChange={(e)=>{
                                                                setOtherFilterBoxDefault(!otherFilterBoxDefault)
                                                                if(filterIssue.includes(e.target.value)){
                                                                    setFilterIssue(filterIssue.filter(type=>type!==e.target.value));
                                                                }else{
                                                                    setFilterIssue([...filterIssue,e.target.value])
                                                                }
                                                            }}
                                                        />
                                                        <p className="text-gray" style={{fontSize:'14px'}}>Other</p>
                                                    </div>
                                                </div>
                                            </Popover.Panel >
                                    
                                        </Transition>
                                    </Popover>

                                    
                                </div>
                                {filterIssue.length > 0 &&
                                    <div className="fixed top-[212px] right-6 flex justify-start items-center gap-2 w-[350px] z-10 py-[6px] px-4 bg-white">
                                            {filterIssue.map((type,index)=>(
                                                <div key={`genres${index}`} className="flex items-center justify-center px-2 py-1 gap-2 rounded-full border-2 text-secondary-gray-3 hover:text-secondary-gray-2 border-secondary-gray-3 hover:border-secondary-gray-2">
                                                    <p className="text-h5 font-semibold">{type}</p>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                                        onClick={()=>{
                                                            setFilterIssue(filterIssue.filter((_,i)=>index!==i));
                                                            if(type === 'Front End'){
                                                                setFrontEndFilterBoxDefault(false);
                                                            }else if(type === 'Back End'){
                                                                setBackEndFilterBoxDefault(false);
                                                            }else{
                                                                setOtherFilterBoxDefault(false);
                                                            }
                                                        }}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                            ))}
                                    </div>
                                }
                                <DragDropContext onDragEnd={(result, provided) => {
                                    if(!result.destination){
                                        return;
                                    }
                                    let items =reorder( issueData , result.source.index , result.destination.index) as issueType[];
                                    
                                    setIssueData(items);
                                }}>
                                    <Droppable droppableId='characters'>
                                        {(provided)=>(
                                            <ul className={`w-80 flex flex-col justify-start items-center ${filterIssue.length > 0 ? 'mt-[245px]' : 'mt-[203px]'}`} {...provided.droppableProps} ref={provided.innerRef}
                                            onClick={()=>setShowOptionInEachIssue(-1)}
                                            > 
                                            {issueData&&
                                            issueData.map((data , index)=>{
                                                let checkIssueInSearch = false;
                                                searchResult.forEach((res)=>{
                                                   if(data.idFromDB === res.idFromDB){
                                                    checkIssueInSearch = true;
                                                   }
                                                })
                                                if(checkIssueInSearch)
                                                return (
                                                <Draggable key={data.idFromDB} draggableId={data.idFromDB} index={index} >
                                                {(provided)=>(
                                                    <li id={data.id} className={`w-full mt-3 relative flex flex-col items-start rounded-lg ${data.selected? 'bg-primary-blue-3 hover:via-tertiary-light-sky-blue' : 'bg-secondary-gray-4 hover:bg-gray-light'} drop-shadow-lg ${showOptionInEachIssue === index ? 'z-10' : 'z-0'}`}    
                                                      {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}  
                                                    >
                                                        <Menu as="div" className="inline-block text-left absolute top-1 right-1 outline-none">
                                                        <div>
                                                                <Menu.Button className="p-2 hover:bg-gray-dark rounded-full ease-in duration-300 cursor-pointer outline-none" onClick={()=>setShowOptionInEachIssue(index)}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                                                    </svg>
                                                                </Menu.Button>
                                                            </div>
                                                            <Transition
                                                                as={Fragment}
                                                                enter="transition ease-out duration-100"
                                                                enterFrom="transform opacity-0 scale-95"
                                                                enterTo="transform opacity-100 scale-100"
                                                                leave="transition ease-in duration-75"
                                                                leaveFrom="transform opacity-100 scale-100"
                                                                leaveTo="transform opacity-0 scale-95"
                                                            >
                                                                <Menu.Items className="absolute -right-0 mt-2 w-56 rounded-md bg-white outline-none" >
                                                                <div>
                                                                    <Menu.Item>
                                                                    {({ active }:any) => (
                                                                        <a
                                                                        href="#"
                                                                        className={`${classNames(
                                                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                            'text-sm'
                                                                        )} flex justify-start items-center hover:bg-primary-blue-3 rounded-t-md px-6 py-3 text-secondary-gray-1 ease-in duration-300`}
                                                                            onClick={()=>{
                                                                                let defaultEditIssue = {} as editIssueType;
                                                                                defaultEditIssue.id = data.id;
                                                                                defaultEditIssue.idFromDB = data.idFromDB;
                                                                                defaultEditIssue.isEditClick = true;
                                                                                defaultEditIssue.score = data.score;
                                                                                defaultEditIssue.title = data.title;
                                                                                defaultEditIssue.selected = data.selected;
                                                                                defaultEditIssue.breakdownTime = data.breakdownTime;
                                                                                defaultEditIssue.ownerName = data.ownerName;
                                                                                defaultEditIssue.votingTime = data.votingTime;
                                                                                defaultEditIssue.issueType = data.issueType;
                                                                                setIsEditIssueClick(defaultEditIssue);
                                                                            }}
                                                                        >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-secondary-gray-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        Edit
                                                                        </a>
                                                                    )}
                                                                    </Menu.Item>
                                                                    
                                                                    <Menu.Item>
                                                                    {({ active }:any) => (
                                                                        <a
                                                                        href="#"
                                                                        className={`${classNames(
                                                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                            'text-sm'
                                                                        )} flex justify-start items-center hover:bg-primary-blue-3 rounded-b-md px-6 py-3 text-secondary-gray-1 ease-in duration-300`}
                                                                        onClick={()=>{
                                                                            let items = reorder(issueData , index , 0) as issueType[];
                                                                            setIssueData(items);
                                                                        }}
                                                                        >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-secondary-gray-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                                                                        </svg>
                                                                        Move to top
                                                                        </a>
                                                                    )}
                                                                    </Menu.Item>   
                                                                    
                                                                    <Menu.Item>
                                                                    {({ active }:any) => (
                                                                        <a
                                                                        href="#"
                                                                        className={`${classNames(
                                                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                            'text-sm'
                                                                        )} flex justify-start items-center hover:bg-primary-blue-3 rounded-b-md px-6 py-3 text-secondary-gray-1 ease-in duration-300`}
                                                                        onClick={()=>{
                                                                            let items = reorder(issueData , index , issueData.length - 1) as issueType[];
                                                                            setIssueData(items);
                                                                        }}
                                                                        >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-secondary-gray-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                                                                        </svg>
                                                                        Move to bottom
                                                                        </a>
                                                                    )}
                                                                    </Menu.Item> 
                                                                    <Menu.Item>
                                                                    {({ active }:any) => (
                                                                        <a
                                                                        href="#"
                                                                        className={`${classNames(
                                                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                            'text-sm'
                                                                        )} flex justify-start items-center ${(reveal !== 3  || !data.selected) ? 'hover:bg-primary-blue-3' :'cursor-not-allowed'} rounded-b-md px-6 py-3 text-secondary-gray-1 ease-in duration-300`}
                                                                        onClick={async()=>{
                                                                            if((reveal !== 3  || !data.selected) ){
                                                                                if(data.selected){
                                                                                    if(stateButtonTime === 1){
                                                                                        firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                                                                                            "isStartBreakdown" : false,
                                                                                            "startBreakDownAt" : 0,
                                                                                            "deleteIssue":data.idFromDB,
                                                                                        })  
                                                                                    }
                                                                                    if(stateButtonTime === 2){
                                                                                        firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                                                                                            "isStartVoting" : false,
                                                                                            "startVotingAt" : 0,
                                                                                            "deleteIssue":data.idFromDB
                                                                                        })
                                                                                    }
                                                                                    setIssueUpdate(1);
                                                                                    setIssueData(issueData.filter((issue,i)=> issue.idFromDB!==data.idFromDB))
                                                                                }
                                                                                else{
                                                                                    setIssueUpdate(1);
                                                                                    setIssueData(issueData.filter((data,i)=> i!==index))
                                                                                }
                                                                                if(allPlayerInRoom !== null){
                                                                                    firebase.database().ref(`poker/alert_user_event/${roomData.roomId}/warning`).set({
                                                                                        message:`"${allPlayerInRoom[0].name}" delete issue: "${data.title}"`
                                                                                    })
                                                                                } 
                                                                            }
                                                                        }}
                                                                        >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-secondary-gray-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Delete
                                                                        </a>
                                                                    )}
                                                                    </Menu.Item>  
                                                                </div>
                                                                </Menu.Items>
                                                            </Transition>
                                                        </Menu>       
                                                        <p className="text-secondary-gray-2 mt-4 ml-4 mb-1 text-h5">Owner : {data.ownerName === '' ? '-' : data.ownerName}</p>
                                                        <p className="text-secondary-gray-2 mt-1 ml-4 mb-1 text-h5">Breakdown time : {secondsToTime(data.selected? timeBreakdown : data.breakdownTime)}</p>
                                                        <p className="text-secondary-gray-2 mt-1 ml-4 mb-1 text-h5">Voting time : {secondsToTime(data.selected ? timeVoting : data.votingTime)}</p>
                                                        <div className="flex justify-start items-center mt-1 ml-4 mb-3 gap-1">
                                                            <p className="text-secondary-gray-2 text-h5">Issue type :</p>
                                                            {data?.issueType?.map((type,typeIndex)=>{
                                                                if(typeIndex !== data?.issueType?.length - 1){
                                                                    return(
                                                                        <div className='flex' key={`typeKey${data.idFromDB}${typeIndex}`}>
                                                                            <p className="text-secondary-gray-2 text-h5">{type} ,</p>
                                                                            
                                                                        </div>
                                                                    );
                                                                }
                                                                return(
                                                                    <div className='flex' key={`typeKey${data.idFromDB}${typeIndex}`}>
                                                                        <p className="text-secondary-gray-2 text-h5">{type} </p>
                                                                            
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        <div className="mb-3 ml-4 w-72 block">
                                                            <span className="break-words text-p" id="link"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{data.title}</Anchorme></span>
                                                        </div>
                                                        <div className="flex w-full justify-between items-center mb-3">     
                                                            <div className={`flex justify-center items-center font-semibold  ${data.selected ? `text-white bg-primary-blue-1 hover:bg-primary-blue-2`: 'bg-secondary-gray-3 hover:bg-secondary-gray-2'}  px-4 py-2 ml-4 rounded-lg ease-in duration-200 ${ reveal !==3 ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                                                onClick={()=>{
                                                                    if(reveal !== 3){
                                                                        setIssueUpdate(1);
                                                                        setIssueData(issueData.map((issue,i)=>{
                                                                            if(issue.selected === true){
                                                                                if(issue.idFromDB !== data.idFromDB){
                                                                                    issue.selected = false;
                                                                                }
                                                                                issue.breakdownTime = timeBreakdown;
                                                                                issue.votingTime = timeVoting;
                                                                            }
                                                                            if(issue.idFromDB === data.idFromDB){
                                                                                (async function() {
                                                                                    if(stateButtonTime === 1){
                                                                                        firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                                                                                            "isStartBreakdown" : false,
                                                                                            "startBreakDownAt" : 0,
                                                                                            "shouldUpdateToFireStore": false,
                                                                                        })
                                                                                    }
                                                                                    if(stateButtonTime === 2){
                                                                                        firebase.database().ref(`poker/issue_counter/${roomData.roomId}`).update({
                                                                                            "isStartVoting" : false,
                                                                                            "startVotingAt" : 0,
                                                                                            "shouldUpdateToFireStore": false,
                                                                                        })
                                                                                    } 
                                                                                }())
                                                                                if(!issue.selected){
                                                                                    issue.selected = true;
                                                                                }else{
                                                                                    issue.selected = false;
                                                                                }
                                                                            }                                  
                                                                            return issue;
                                                                        }));     
                                                                    }                  
                                                                }}
                                                            >
                                                                {TextVoteButton(data)}
                                                            </div>
                                                            
                                                            <Popover>
                                                                <Popover.Button className={`mr-4 flex justify-center items-center py-2 px-4 rounded-lg ${data.selected ? 'bg-white hover:bg-primary-blue-4' : 'bg-secondary-gray-3 hover:bg-secondary-gray-2'} font-bold ease-in duration-200 cursor-pointer`}
                                                                    onClick={(e:any)=>{
                                                                        e.stopPropagation();
                                                                        setShowOptionInEachIssue(index);
                                                                    }}
                                                                >
                                                                    {data.score}
                                                                </Popover.Button>
                                                                <Transition
                                                                    enter="transition duration-100 ease-out"
                                                                    enterFrom="transform scale-95 opacity-0"
                                                                    enterTo="transform scale-100 opacity-100"
                                                                    leave="transition duration-75 ease-out"
                                                                    leaveFrom="transform scale-100 opacity-100"
                                                                    leaveTo="transform scale-95 opacity-0"
                                                                >
                                                                    <Popover.Panel className="absolute w-45 px-3 py-3 flex flex-col items-center right-0 bottom-12 bg-white rounded-lg drop-shadow-md" >
                                                                        <TextField type={'number'} value={editIssueScore} variant="outlined" label="Edit issue points" size={'small'}
                                                                            onChange={(e)=>{
                                                                                if (Number(e.target.value) > 1000) {
                                                                                    setEditIssueScore('1000');
                                                                                } else if (Number(e.target.value) < 0) {
                                                                                    setEditIssueScore('0');
                                                                                } else {
                                                                                    setEditIssueScore(`${Number(e.target.value)}`);
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Popover.Button className="flex justify-center items-center w-36 bg-primary-blue-1  rounded-md py-1 mt-2 cursor-pointer duration-150 ease-in hover:bg-primary-blue-2 gap-2"
                                                                            onClick={async()=>{
                                                                                await updateIssueScore(roomData.roomId , data.idFromDB , editIssueScore);
                                                                            }}
                                                                        >
                                                                            <p className='text-white font-semibold py-1 mr-2'>Confirm</p>
                                                                        </Popover.Button>
                                                                    </Popover.Panel>
                                                                </Transition>
                                                            </Popover>
                                                            
                                                        </div>
                                                    </li>
                                                )}
                                                </Draggable>
                                            )}) 
                                            }
                                            {provided.placeholder}
                                            </ul>
                                        )}
                                        </Droppable>
                                    </DragDropContext>
                                    <div className={`flex flex-col justify-center items-center sticky bottom-0 bg-white mt-4 ${addIssueClick ? '' : ''}`} style={{width:360}}>
                                        { addIssueClick ?
                                        <div className="w-80 flex flex-col justify-start items-center mt-2 mb-2" style={{minHeight:100}}>
                                            <div className="w-80 flex flex-col justify-start items-center bg-secondary-gray-4 rounded-lg">
                                                <textarea ref={addIssueRef} style={{resize:'none',minHeight:96}} className="focus:outline-none bg-transparent w-72 mt-4 mb-4" placeholder='Enter a title for the issue' />
                                                
                                            </div>
                                            <div className="w-80 flex flex-col justify-start items-center bg-secondary-gray-4 rounded-lg mt-3">
                                                
                                                <input ref={addOwnerIssueRef}  className="focus:outline-none bg-transparent w-72 my-2" placeholder='Enter owner name' />
                                            </div>
                                            <div className='w-80 flex justify-center items-center gap-3 mt-3'>
                                                <p className=" text-gray font-semibold" style={{fontSize:'14px'}}>Type : </p>
                                                <div className='flex justify-center items-center gap-1'>
                                                    <input type="checkbox" className="w-4 h-4" value="Front End" 
                                                        onChange={(e)=>{
                                                            if(issueTypes.includes(e.target.value)){
                                                                setIssueTypes(issueTypes.filter(type=>type!==e.target.value));
                                                            }else{
                                                                setIssueTypes([...issueTypes,e.target.value])
                                                            }
                                                        }}
                                                    />
                                                    <p className=" text-secondary-gray-2 font-semibold" style={{fontSize:'14px'}}> Front End</p>
                                                </div>
                                                <div className='flex justify-center items-center gap-1'>
                                                    <input type="checkbox" className="w-4 h-4" value="Back End"
                                                        onChange={(e)=>{
                                                            if(issueTypes.includes(e.target.value)){
                                                                setIssueTypes(issueTypes.filter(type=>type!==e.target.value));
                                                            }else{
                                                                setIssueTypes([...issueTypes,e.target.value])
                                                            }
                                                        }}
                                                    />
                                                    <p className="text-secondary-gray-2 font-semibold" style={{fontSize:'14px'}}> Back End</p>
                                                </div>
                                                <div className='flex justify-center items-center gap-1'>
                                                    <input type="checkbox" className="w-4 h-4" value="Other"
                                                        onChange={(e)=>{
                                                            if(issueTypes.includes(e.target.value)){
                                                                setIssueTypes(issueTypes.filter(type=>type!==e.target.value));
                                                            }else{
                                                                setIssueTypes([...issueTypes,e.target.value])
                                                            }
                                                        }}
                                                    />
                                                    <p className="text-secondary-gray-2 font-semibold" style={{fontSize:'14px'}}>Other</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center w-80 mt-4">
                                                <div className="flex justify-center items-center text-blue font-bold text-p border-2 border-secondary-gray-4 py-2 px-5 rounded-lg hover:bg-primary-blue-3 cursor-pointer ease-in duration-200" style={{width: 150}}
                                                    onClick={()=>{
                                                        setAddIssueClick(false)
                                                        setIssueTypes([]);
                                                    }}
                                                >
                                                    Cancel
                                                </div>
                                                <div className="flex justify-center items-center text-white font-bold text-p border-2 border-blue py-2 rounded-lg bg-primary-blue-1 hover:bg-primary-blue-2 hover:border-primary-blue-2  cursor-pointer ease-in duration-200" style={{width: 150}}
                                                    onClick={()=>{
                                                        if(addIssueRef.current && addOwnerIssueRef.current){
                                                            setAddIssueClick(false);
                                                            let issueObj = {} as issueType;
                                                            issueObj.title = addIssueRef.current?.value
                                                            issueObj.id = getIssueId();
                                                            issueObj.score = '-'
                                                            issueObj.selected = false;
                                                            issueObj.ownerName = addOwnerIssueRef.current?.value;
                                                            issueObj.breakdownTime = 0;
                                                            issueObj.votingTime = 0;
                                                            if(issueTypes.length === 0){
                                                                issueObj.issueType = ['Other']
                                                            }else{
                                                                issueObj.issueType = issueTypes.sort();
                                                            }
                                                            addIssueRef.current.value = "";
                                                            addOwnerIssueRef.current.value = "";
                                                            setIssueTypes([]);
                                                            (async function(){
                                                                try{
                                                                    let res = await createIssue(roomData.roomId, issueObj.id, issueObj.title , issueObj.ownerName,issueObj.issueType);
                                                                }catch(err){
                                                                    console.log(err);
                                                                }
                                                            }())
                                                        }
                                                    }}
                                                >
                                                    Save
                                                </div>
                                            </div>
                                        </div>
                                        :<div className='w-80 flex justify-start items-center py-3 mt-3 mb-3 hover:bg-secondary-gray-4 rounded-lg cursor-pointer ease-in-out duration-300'
                                            onClick={()=>{setAddIssueClick(true)}}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-gray-1 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            <p className="text-secondary-gray-1 font-semibold ml-3">{issueData.length > 0 ? 'Add another issue' :'Add an issue'}</p>
                                        </div>}
                                    </div>
                            </motion.div>}
                    </motion.div>}
                </AnimatePresence>
    )
}

export default IssueBar