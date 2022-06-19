import React , {useEffect, useMemo, useState} from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { averageVoteState, isClearingScoreState, isReveal, issueDataState, issueUpdateState, loadingState, localResetVoteState, PlayerInRoomType, playersInRoom, RoomDataState, syncVotingSequenceState, UserData, votingSequenceState } from '../../PokerStateManagement/Atom'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation , Mousewheel } from "swiper";
import { directUpdateFirebaseVote, generateKey, updateAverageVote, updateVote } from '../../pages/api/PokerAPI/api';
import firebase from '../../firebase/firebase-config';
import { AnimatePresence , motion} from 'framer-motion';
import { useSnackbar } from 'notistack';
import { Button } from "@mui/material";
import CountUp from 'react-countup';

function PookerFooter() {
    const { enqueueSnackbar , closeSnackbar } = useSnackbar();
    const [ sequenceData , setSequenceData ] = useRecoilState(votingSequenceState);
    const reveal = useRecoilValue(isReveal)
    const [allPlayerInRoom , setAllPlayerInRoom] = useRecoilState(playersInRoom);
    const roomData = useRecoilValue(RoomDataState);
    const userData = useRecoilValue(UserData)
    const [ showNotification , setShowNotification ] = useState<boolean>(false);
    const [ freezePlayerVote , setFreezePlayerVote ] = useState<PlayerInRoomType[]>();
    const [ issueUpdate , setIssueUpdate ] = useRecoilState(issueUpdateState);
    const [ issueData , setIssueData ] = useRecoilState(issueDataState);
    const [ averageVote , setAverageVote ] = useRecoilState(averageVoteState);
    const [ summaryVote , setSummaryVote ] = useState<Map<string, number> | null>(null);
    const [ countVote , setCountVote ] = useState<number>(0);
    const [ localResetVote , setLocalResetVote ] = useRecoilState(localResetVoteState);
    const [ loading , setLoading ] = useRecoilState(loadingState);
    const isClearingScore  = useRecoilValue(isClearingScoreState);
    const syncVotingSequence = useRecoilValue(syncVotingSequenceState);

    function Notification(type:any, message:string){
        enqueueSnackbar( message,{ 
            variant: type,
            autoHideDuration: 10000,
            action: (key) => (
                    <Button size='small' style={{color:'white'}}  onClick={() => closeSnackbar(key)}>
                        Dismiss
                    </Button>
            ) 
        });
    }
    
    function round(value:number, step:number) {
        step || (step = 1.0);
        var inv = 1.0 / step;
        return Math.round(value * inv) / inv;
    }

    function compare( a:PlayerInRoomType, b:PlayerInRoomType ) {
        if(a.vote === '-' || a.vote === '?'  || b.vote === '-' || b.vote=== '?'){
            if ( a.vote < b.vote ){
                return -1;
              }
              if ( a.vote > b.vote ){
                return 1;
              }
              return 0;
        }
        if ( Number(a.vote) < Number(b.vote) ){
          return -1;
        }
        if ( Number(a.vote) >Number(b.vote )){
          return 1;
        }
        return 0;
      }

      
    useEffect(()=>{
        if(reveal === 0 ){    
            //calculate average and update average issue selected
            if(allPlayerInRoom !==null && allPlayerInRoom[0]?.isHost && !isClearingScore){
                let countVote = 0 as number;
                let countPoint = 0 as number;
                allPlayerInRoom?.forEach((player)=>{
                    if(player?.vote !== '-' && player.vote !== '?'){
                        countPoint+= Number(player?.vote)
                        countVote++;
                    }
                })
                let average = (countPoint / countVote).toFixed(2);
                (async function(){
                    try{                       
                        await updateAverageVote(roomData.roomId , average);
                    }catch(err){
                        console.log(err);
                    }
                }());

                //update issue selected
                setIssueUpdate(1);
                setIssueData(issueData.map((issue)=>{
                    if(issue.selected)
                        issue.score = String(round(Number(average),0.5));
                    return issue;
                }));
                
            }
            
            //update summaryVote
            let cloneAllPlayer = allPlayerInRoom?.map((player)=>player)
            cloneAllPlayer?.sort(compare)
            let mapCardToCountVote  = new Map<string,number> ();
            let count = 0;
            //setKey
            for(let i = 0 ; i<= 40 ; i++){
                mapCardToCountVote.set(String(i), 0);
                if(i==0){
                    mapCardToCountVote.set(String(0.5), 0);
                }else if(i==40){
                    mapCardToCountVote.set('?',0);
                }
            } 
            
            cloneAllPlayer?.forEach((player)=>{
                if(player?.vote !== '-'){   
                    count += 1;
                    let value = mapCardToCountVote.get(player?.vote) as number;
                    value +=1 ;
                    mapCardToCountVote.set(player?.vote,value);
                }
            })
            setSummaryVote(mapCardToCountVote);
            setCountVote(count);
        }
    },[reveal , allPlayerInRoom])

    useEffect(()=>{
        //check show notification
        if(reveal === 0 && allPlayerInRoom!==null) {
            let cloneAllPlayer = allPlayerInRoom?.map((player)=>player)
            cloneAllPlayer?.sort(compare)
            let mapCardToCountVote  = new Map<string,number> ();
            sequenceData.forEach((card)=>{
                mapCardToCountVote.set(String(card), 0);
            })
            
            cloneAllPlayer?.forEach((player)=>{
                if(player?.vote !== '-'){   
                    let value = mapCardToCountVote.get(player?.vote) as number;
                    value +=1 ;
                    mapCardToCountVote.set(player?.vote,value);
                }
            })
            let iterator = mapCardToCountVote.keys();
            let allKey = [] as string[];
            for(let i = 0 ; i < mapCardToCountVote.size ; i++){
                let key = iterator.next().value;
                allKey.push(key);
            }   
            let min = Infinity;
            let minIndex = 0;
            let max = -1;
            let maxIndex = allKey.length - 1;
            for(let i = 0 ; i < allKey.length ; i++){
                if(allKey[i] !== '?' && Number(mapCardToCountVote.get(allKey[i])) > 0 &&  max <= Number(allKey[i])){
                    max = Number(allKey[i]);
                    maxIndex = i ;
                }
                if(allKey[i] !== '?' && Number(mapCardToCountVote.get(allKey[i])) > 0 &&  min >= Number(allKey[i])){
                    min = Number(allKey[i]);
                    minIndex = i;
                }
            }
            if( max !== -1 && min !== Infinity && Math.abs(maxIndex-minIndex) > 2 && syncVotingSequence === 'fibo'){
                Notification("error","Some users' score different from others");
            } 
        }
    },[reveal, sequenceData])

    function showSummaryVote(){
        interface objectForRenderSummaryType{
            card:string,
            quantity:number;
        }

        if(summaryVote!== null){
            let arrayForRenderSummary = [] as objectForRenderSummaryType[];
            let iterator = summaryVote.keys()
            let keyOfSummaryVote = [] as string[];
            for(let i = 0 ; i < summaryVote.size ; i++){
                let key = iterator.next().value;
                keyOfSummaryVote.push(key);
            }
            keyOfSummaryVote.forEach((key)=>{
                let objectForRenderSummary = {} as objectForRenderSummaryType;
                objectForRenderSummary.card = key;
                objectForRenderSummary.quantity = summaryVote.get(key) as number;
                if(objectForRenderSummary.quantity !== 0)
                    arrayForRenderSummary.push(objectForRenderSummary);
            })

            return arrayForRenderSummary?.map((player , index)=>(
                <div key={`${index+100}`}  className="flex flex-col items-center justify-center">
                    <motion.div className="h-20 w-2 rounded-full bg-primary-blue-3 relative"
                        animate={{ opacity: 1 }}
                        initial={{opacity : 0}}
                        exit = {{ opacity : 0  }}
                        transition={{  duration: 1 }}
                    >
                        <motion.div className={`absolute bottom-0 w-2 bg-black-opa80 rounded-full`} style={{height:`${Math.round((player?.quantity / countVote) * 100)}%`}}
                        animate={{height:`${Math.round((player?.quantity / countVote) * 100)}%` }}
                        initial={{height: 0}}
                        transition={{  duration: 1.2 }}>
                            {/* <div ></div> */}
                        </motion.div>
                    </motion.div>
                    <motion.div className="w-11 h-16 border-2 border-primary-blue-2 flex justify-center items-center rounded-md text-primary-blue-2 font-semibold mt-2" 
                                animate={{ opacity: 1  ,rotateY:0}}
                                initial={{opacity : 0 , rotateY:-90}}
                                exit = {{ opacity : 0  }}
                                transition={{  duration: 1.2 }}
                            >
                                {player?.card}
                    </motion.div>
                    <motion.p className="font-semibold mt-1 w-20 text-center overflow-hidden"
                        animate={{ opacity: 1  ,rotateY:0}}
                        initial={{opacity : 0 , rotateY:-90}}
                        exit = {{ opacity : 0  }}
                        transition={{  duration: 1.2 }}
                    >{player?.quantity} vote</motion.p>
                </div>
            ))
        }
        return;
        
    }

    if(reveal ===1 || reveal === 2 || reveal === 3 ) 
        return (
            <div className='w-full sticky bottom-0 pb-1 flex justify-center items-center bg-white'>
                <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-center">
                        {allPlayerInRoom && <p className="font-semibold text-secondary-gray-2">{reveal === 3 ? 'Counting votes...' : `${allPlayerInRoom[0]?.vote === '-' ? 'Choose your card 👇': `Choose : ${allPlayerInRoom[0]?.vote}`}`}</p>}
                    </div>
                    <Swiper
                        mousewheel={true}
                        draggable={true}
                        slidesPerView={5}
                        spaceBetween={5}
                        navigation={true}
                        slidesPerGroup={4}
                        modules={[Navigation , Mousewheel]}
                        breakpoints={{
                            640:{
                                slidesPerView:7,
                                slidesPerGroup:5,
                            },
                            768:{
                                spaceBetween:5,
                                slidesPerView:10,
                                slidesPerGroup:9,
                            },
                            1024:{
                                spaceBetween:10,
                                slidesPerView:12,
                                slidesPerGroup:12,
                            }
                        }}
                        className="w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-3xl z-40 overflow-y-visible"
                        style={{height:100 , maxHeight:100 ,paddingTop:10 , paddingBottom:10 , paddingLeft:25, paddingRight:25}}
                    >
                        {allPlayerInRoom && sequenceData.map((data)=>(
                            <SwiperSlide key={generateKey(data)} className={`border-2 flex justify-center items-center rounded-md ${reveal ===3 ? 'border-secondary-gray-3' : 'text-blue border-blue'} font-semibold text-h4 ease-in duration-200 ${allPlayerInRoom[0]?.vote === data && reveal === 3 ? 'bg-secondary-gray-3 text-white -translate-y-2' : ''} ${allPlayerInRoom[0]?.vote !== data && reveal === 3 ? 'text-secondary-gray-3 ':''} ${allPlayerInRoom[0]?.vote === data && reveal !==3 ?'bg-primary-blue-1 text-white -translate-y-2' :'' } ${reveal === 3 ? '' :'hover:bg-primary-blue-3 hover:-translate-y-1 cursor-pointer'} `} 
                                onClick={()=>{
                                    if(reveal !== 3){

                                        (async function(){
                                            try {
                                                if(roomData.roomId !== null && userData.userId !== null){
                                                    //let res = await updateVote(roomData.roomId ,userData.userId ,data);
                                                    if(allPlayerInRoom[0]?.vote === data)
                                                        await directUpdateFirebaseVote(roomData.roomId ,userData.userId ,'-' );
                                                    else
                                                        await directUpdateFirebaseVote(roomData.roomId ,userData.userId ,data);
                                                }  
                                            }catch(err){
                                                console.log(err);
                                            }
                                        }())
                                    }
                                }}
                            >
                                {data}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    
                               
                </div>
                

            </div>
        )
   
    if(reveal=== 0 && localResetVote){
        return(
            <div className='w-full sticky bottom-0 pb-1 flex justify-center items-center bg-white'>
                <div className="w-full flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-center">
                        {allPlayerInRoom && <p className="font-semibold text-secondary-gray-2">{loading ? 'Counting votes...' : `${allPlayerInRoom[0]?.vote === '-' ? 'Choose your card 👇': `Choose : ${allPlayerInRoom[0]?.vote}`}`}</p>}
                    </div>
                    
                
                    <Swiper
                        mousewheel={true}
                        draggable={true}
                        slidesPerView={5}
                        spaceBetween={5}
                        navigation={true}
                        slidesPerGroup={4}
                        modules={[Navigation , Mousewheel]}
                        breakpoints={{
                            640:{
                                slidesPerView:7,
                                slidesPerGroup:5,
                            },
                            768:{
                                spaceBetween:5,
                                slidesPerView:10,
                                slidesPerGroup:9,
                            },
                            1024:{
                                spaceBetween:10,
                                slidesPerView:12,
                                slidesPerGroup:12,
                            }
                        }}
                        className="w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-3xl z-40 overflow-y-visible"
                        style={{height:100 , maxHeight:100 ,paddingTop:10 , paddingBottom:10 , paddingLeft:25, paddingRight:25}}
                    >
                        {allPlayerInRoom && sequenceData.map((data)=>(
                            <SwiperSlide key={generateKey(data)} className={`border-2 flex justify-center items-center rounded-md ${loading ? 'border-secondary-gray-3' : 'text-blue border-blue'} font-semibold text-h4 ease-in duration-200 ${allPlayerInRoom[0]?.vote === data && loading ? 'bg-secondary-gray-3 text-white -translate-y-2' : ''} ${allPlayerInRoom[0]?.vote !== data && loading ? 'text-secondary-gray-3 ':''} ${allPlayerInRoom[0]?.vote === data && loading ?'bg-primary-blue-1 text-white -translate-y-2' :'' } ${loading ? '' :'hover:bg-primary-blue-3 hover:-translate-y-1 cursor-pointer'} `} 
                                onClick={()=>{
                                        (async function(){
                                            try {
                                                if(roomData.roomId !== null && userData.userId !== null){
                                                    //let res = await updateVote(roomData.roomId ,userData.userId ,data);
                                                    setLoading(true);
                                                    await directUpdateFirebaseVote(roomData.roomId ,userData.userId ,data);
                                                    setLoading(false);
                                                    setLocalResetVote(false);
                                                }  
                                            }catch(err){
                                                console.log(err);
                                            }
                                        }())   
                                }}
                            >
                                {data}
                            </SwiperSlide>
                        ))}
                    </Swiper>            
                </div>
            </div>
        );
    }

     //ใส่สกอร์เฉลี่ย
    return(
        <div className='w-full sticky bottom-0 pb-1 flex justify-center items-center bg-white'>
            <div className='w-full max-w-3xl flex justify-center items-center'>
                <div className="flex max-w-2xl overflow-x-auto w-fit justify-start items-center">
                    {showSummaryVote()}           
                </div>
                <motion.div className="flex flex-col items-center ml-5 justify-center"
                        animate={{opacity:1}}
                        initial={{opacity:0}}
                        transition={{duration:1.2}}
                    >
                    <div className="flex flex-col justify-center items-center w-fit">
                        <div className="flex flex-col items-center">
                            <p className="font-semibold text-secondary-gray-2">Average:</p>
                            <p className="font-bold text-h3">
                                <CountUp duration={0.8} decimals={2} end={Number(averageVote)}/>
                            </p>
                        </div>
                        <div className="flex flex-col items-center mt-2">
                            <p className="font-semibold text-blue">Estimate:</p>
                            <p className="font-bold text-h3 text-primary-blue-2">
                                <CountUp duration={0.8} decimals={2} end={round(Number(averageVote),0.5)}/>
                            </p>
                        </div>
                    </div>
                    <Button className="flex justify-center items-center drop-shadow-md" style={{marginTop:'20px', backgroundColor:'rgb(135 181 231 / var(--tw-bg-opacity))'}}
                            onClick={async()=>{ 
                                    try{
                                        await directUpdateFirebaseVote(roomData.roomId ,userData.userId ,'-' );
                                        setLocalResetVote(true);
                                    }catch(err){
                                        console.log(err);
                                    }
                            }}>
                            <p className="text-h5 normal-case text-white">Reset your card</p>
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}

export default PookerFooter