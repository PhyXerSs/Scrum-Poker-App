import React, { useRef , useState } from 'react'

import TextField from "@mui/material/TextField";
import { useRecoilState } from 'recoil';
import { isUploadNewPhotoState, loadingState, maxBackEndPointState, maxFrontEndPointState, maxOtherPointState, RoomDataState, RoomDataType, UserData, UserDataType } from '../../PokerStateManagement/Atom';
import { AnimatePresence , motion} from 'framer-motion';
import { addMember, createRoom, updateUserPicture } from '../../pages/api/PokerAPI/api';
import { useSnackbar } from "notistack";
import { Button } from "@mui/material";
import UploadNewPhoto from './UploadNewPhoto';
import { useRouter } from "next/router"

function CreateRoom() {
    const usernameRef = useRef<HTMLInputElement>(null);
    const joinRoomPinRef = useRef<HTMLInputElement>(null);
    const roomNameRef = useRef<HTMLInputElement>(null);
    const [ userData , setUserData ] = useRecoilState(UserData);
    const [ roomData , setRoomData ] = useRecoilState(RoomDataState);
    const [ createOrJoin , setCreateOrJoin ] = useState<number>(0)
    const [ delayAnimation , setDalayAnimation ] = useState<boolean>(false)
    const [ showInvalidPin , setShowInvalidPin ] = useState<boolean>(false)
    const [ isLoading , setIsLoading ] = useRecoilState(loadingState);
    const [ selectedImage , setSelectedImage ] = useState<string>('data:image/png;base64,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')
    const [ isSelectedImage , setIsSelectedImage ] = useState<boolean>(false);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [isUploadNewPhoto, setIsUploadNewPhoto] = useRecoilState(isUploadNewPhotoState);
    const [ maxFrontEndPoint , setMaxFrontEndPoint ] = useRecoilState(maxFrontEndPointState)
    const [ maxBackEndPoint , setMaxBackEndPoint ] = useRecoilState(maxBackEndPointState); 
    const [ maxOtherPoint , setMaxOtherPoint ] = useRecoilState(maxOtherPointState);
    const router = useRouter();
    
    function Notification(type: any, message: string) {
        enqueueSnackbar(message, {
        variant: type,
        autoHideDuration: 5000,
        action: (key) => (
            <Button
            size="small"
            style={{ color: "white" }}
            onClick={() => closeSnackbar(key)}
            >
            Dismiss
            </Button>
        ),
        });
    }

    function onlyNumberKey(evt:any) {
        // Only ASCII character in that range allowed
        var ASCIICode = (evt.which) ? evt.which : evt.keyCode
        if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
            return false;
        return true;
    }


    function StateCreateRoom(){
        if(createOrJoin === 0 ){
            return(
                <motion.div className="flex flex-col justify-center items-start w-full max-w-xl bg-white py-16 px-12 rounded-3xl relative"
                    animate={{ opacity: 1 , y:0 }}
                    initial={{opacity : 0 , y:-150 }}
                    exit ={{ opacity : 0  ,}}
                    transition={{  duration: 0.7 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 absolute top-2 left-2 p-1 text-secondary-gray-2 rounded-full duration-200 ease-in hover:cursor-pointer hover:bg-secondary-gray-3 hover:text-white " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        onClick={()=>{
                            let user = {} as UserDataType;
                            user.username = '-';
                            user.profilePicture = '/static/images/bg/Group 1@3x.png';
                            user.userId = '-';
                            setDalayAnimation(false)
                            setTimeout(()=>setUserData(user),800)
                        }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    
                    <button type="submit" className="w-full flex justify-center items-center drop-shadow-lg bg-blue hover:cursor-pointer hover:bg-primary-blue-2 duration-200 ease-in text-white font-bold py-2 rounded-md "
                        onClick={()=>{
                            setDalayAnimation(false);
                            setTimeout(()=>{setCreateOrJoin(1) ; setDalayAnimation(true)},800)
                        }}
                    >
                        Create Room
                    </button>
                    <button type="submit" className="w-full flex justify-center items-center drop-shadow-lg bg-blue hover:cursor-pointer hover:bg-primary-blue-2 duration-200 ease-in text-white font-bold py-2 rounded-md mt-12"
                        onClick={()=>{
                            setDalayAnimation(false);
                            setTimeout(()=>{setCreateOrJoin(2) ; setDalayAnimation(true)},800)
                        }}
                    >
                        Join Room
                    </button>
                </motion.div>
                
            )
        }else if(createOrJoin === 1){
            return(
                <motion.div className="flex flex-col justify-center items-start w-full max-w-xl bg-white py-16 px-12 rounded-3xl relative"
                    animate={{ opacity: 1 , y: 0}}
                    initial={{opacity : 0 , y:-150 }}
                    exit ={{ opacity : 0  }}
                    transition={{  duration: 0.7 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 absolute top-2 left-2 p-1 text-secondary-gray-2 rounded-full duration-200 ease-in hover:cursor-pointer hover:bg-secondary-gray-3 hover:text-white " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        onClick={()=>{
                            if(roomNameRef.current !== null && roomNameRef.current.value !== '')
                                roomNameRef.current.value = '';
                            setDalayAnimation(false);
                            setTimeout(()=>{setCreateOrJoin(0) ; setDalayAnimation(true)},800)
                        }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <p className="font-bold text-h4 text-gray"> Choose your room name</p>
                    <form  className="w-full" 
                        onSubmit={(e)=>{
                            
                            (async function(){
                                if(!onlyNumberKey(maxFrontEndPoint)){
                                    Notification('error','Front End points must be numbers only!') 
                                }
                                if(!onlyNumberKey(maxBackEndPoint)){
                                    Notification('error','Back End points must be numbers only!') 
                                }
                                if(!onlyNumberKey(maxOtherPoint)){
                                    Notification('error','Other points must be numbers only!') 
                                }
                                if(roomNameRef.current !== null && roomNameRef.current.value !== '' && !isLoading && onlyNumberKey(maxFrontEndPoint) && onlyNumberKey(maxFrontEndPoint) && onlyNumberKey(maxBackEndPoint) && onlyNumberKey(maxOtherPoint)){
                                    // console.log(roomNameRef.current.value);
                                    setIsLoading(true);
                                    try{
                                        let res = await createRoom(roomNameRef.current.value.replaceAll(" ","").replaceAll("-",""),userData.username ,maxFrontEndPoint , maxBackEndPoint , maxOtherPoint) as string[];
                                        await updateUserPicture(res[1], res[0], selectedImage);
                                        setIsLoading(false)
                                        let room = {} as RoomDataType;
                                        room.roomname = roomNameRef.current.value.replaceAll(" ","").replaceAll("-","");
                                        room.roomId = res[0];
                                        roomNameRef.current.value = '';
                                        let user = {} as UserDataType;
                                        user.username = userData.username;
                                        user.profilePicture = userData.profilePicture;
                                        user.userId = res[1];
                                        user.isHost = true;
                                        router.push(`/poker#${res[0]}`);

                                        setDalayAnimation(false);
                                        setTimeout(() => {setRoomData(room);setUserData(user);setCreateOrJoin(0)}, 800);
                                    }catch(err){
                                        console.log(err);
                                        setIsLoading(false)
                                        Notification('error','Server Connection Lost')
                                    }
                                }
                            }())
                            e.preventDefault();
                        }}
                    >
                    <TextField required inputRef={roomNameRef} fullWidth variant="outlined" label="Room name" size={'small'} style={{ marginTop:'50px' }}/>
                    
                    <div className="w-full flex items-center justify-between mt-12">
                        <div className="flex items-center w-36">
                            <TextField type={'number'} value={maxFrontEndPoint} variant="outlined" label="Front End Points" size={'small'}
                                onChange={(e)=>{
                                    if (Number(e.target.value) > 1000) {
                                        setMaxFrontEndPoint('1000');
                                      } else if (Number(e.target.value) < 0) {
                                        setMaxFrontEndPoint('0');
                                      } else {
                                        setMaxFrontEndPoint(`${Number(e.target.value)}`);
                                    }
                                }}
                            />
                        </div>
                        <div className="flex items-center w-36">
                            <TextField type={'number'} value={maxBackEndPoint} variant="outlined" label="Back End Points" size={'small'} 
                                onChange={(e)=>{
                                    if (Number(e.target.value) > 1000) {
                                        setMaxBackEndPoint('1000');
                                      } else if (Number(e.target.value) < 0) {
                                        setMaxBackEndPoint('0');
                                      } else {
                                        setMaxBackEndPoint(`${Number(e.target.value)}`);
                                    }
                                }}
                            />
                        </div>
                        <div className="flex items-center w-36">
                            <TextField type={'number'} value={maxOtherPoint} variant="outlined" label="Other Points" size={'small'} 
                                onChange={(e)=>{
                                    if (Number(e.target.value) > 1000) {
                                        setMaxOtherPoint('1000');
                                      } else if (Number(e.target.value) < 0) {
                                        setMaxOtherPoint('0');
                                      } else {
                                        setMaxOtherPoint(`${Number(e.target.value)}`);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <button type="submit" className={`w-full flex justify-center items-center drop-shadow-lg ${isLoading ? 'bg-primary-blue-2 cursor-default' : 'bg-blue cursor-pointer'}hover:bg-primary-blue-2 duration-200 ease-in text-white font-bold py-2 rounded-md mt-12`}>
                        Create Room
                    </button>
                    </form>
            </motion.div>
            )

        }else if(createOrJoin === 2){
            return <motion.div className="flex flex-col justify-center items-start w-full max-w-xl bg-white py-16 px-12 rounded-3xl relative"
                        animate={{ opacity: 1 , y: 0 }}
                        initial={{opacity : 0 , y:-150 }}
                        exit ={{ opacity : 0  }}
                        transition={{  duration: 0.7 }}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 absolute top-2 left-2 p-1 text-secondary-gray-2 rounded-full duration-200 ease-in hover:cursor-pointer hover:bg-secondary-gray-3 hover:text-white " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        onClick={()=>{
                            if(joinRoomPinRef.current !== null && joinRoomPinRef.current.value !== '')
                                joinRoomPinRef.current.value = '';
                            setDalayAnimation(false);
                            setTimeout(()=>{setCreateOrJoin(0) ; setDalayAnimation(true)},800)
                            
                        }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <form  className="w-full h-fit" 
                        onSubmit={(e)=>{
                            (async function(){
                                if(joinRoomPinRef.current !== null && joinRoomPinRef.current.value !== '' && !isLoading){
                                    setIsLoading(true)
                                    try{
                                        let resJoinRoom = await addMember( joinRoomPinRef.current.value , userData.username) as string[]
                                        await updateUserPicture(resJoinRoom[0],resJoinRoom[1], selectedImage);
                                        setIsLoading(false)
                                        if(resJoinRoom.length === 3 ){
                                            let user = {} as UserDataType;
                                            user.username = userData.username;
                                            user.profilePicture = userData.profilePicture;
                                            user.userId = resJoinRoom[0];
                                            user.isHost = false;
                                            //******************************
                                            joinRoomPinRef.current.value = ''; 
                                            let room = {} as RoomDataType;
                                            room.roomname = resJoinRoom[2];
                                            room.roomId = resJoinRoom[1]
                                            router.push(`/poker#${resJoinRoom[1]}`);
                                            setDalayAnimation(false);
                                            setTimeout(() => {setRoomData(room);setUserData(user);setCreateOrJoin(0)}, 800);
                                        }else{
                                            setShowInvalidPin(true)
                                            setTimeout(()=>setShowInvalidPin(false),2000);
                                        }
                                    }catch(err){
                                        console.log(err);
                                        setIsLoading(false)
                                        Notification('error','Server Connection Lost')
                                    }
                                }
                            }())
                            e.preventDefault();
                        }}
                    >
                    <TextField required inputRef={joinRoomPinRef} fullWidth variant="outlined" label="Invite code" size={'small'} style={{ marginTop:'0px' }}/>  
                    <button type="submit" className={`w-full flex justify-center items-center drop-shadow-lg ${isLoading ? 'bg-primary-blue-2 cursor-default' : 'bg-blue cursor-pointer'} hover:bg-primary-blue-2 duration-200 ease-in text-white font-bold py-2 rounded-md mt-16`}>
                        Join
                    </button>
                    </form>
                    <AnimatePresence>
                                    {showInvalidPin && 
                                    <motion.div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 bg-secondary-gray-4 font-semibold text-danger rounded-2xl drop-shadow-md"
                                        animate={{opacity:1}}
                                        initial={{opacity:0}}
                                        exit={{opacity:0}}
                                        transition={{duration:0.5}}
                                    >
                                        Invalid pin
                                    </motion.div>}
                    </AnimatePresence>
            </motion.div>
        }
    }

    return (
        <AnimatePresence>

            <UploadNewPhoto setSelectedImage={setSelectedImage} setIsSelectedImage={setIsSelectedImage}/>

            {userData.userId === '-' || roomData.roomId === '-' ?
        <motion.div className="h-screen w-full fixed top-0 left-0  flex justify-center items-center z-50 bg-blue-dark-op50 "
            animate={{ opacity: 1 }}
            initial={{opacity : 0  }}
            exit = {{ opacity : 0 }}
            transition={{  duration: 1 }}
        >
            <AnimatePresence>
                {userData.userId === '-'? 
                    <motion.div className="flex flex-col justify-center items-start w-full max-w-xl bg-white py-16 px-12 rounded-3xl"
                    animate={{ opacity: 1  ,y:0}}
                    initial={{opacity : 0 , y:-150}}
                    exit = {{ opacity : 0  }}
                    transition={{  duration: 0.6 }}
                    >
                        <p className="font-bold text-h4 text-gray"> Choose your display information</p>
                        <form  className="w-full" 
                            onSubmit={(e)=>{
                                e.preventDefault();
                                let roomIdFromPath = router.asPath.split('#')[1] as string;
                                
                                (async function(){
                                    if(usernameRef.current !== null && usernameRef.current.value !== '' && !isLoading){
                                        let user = {} as UserDataType;
                                        user.username = usernameRef.current.value.replaceAll(" ","").replaceAll("-","");
                                        user.profilePicture = selectedImage;
                                        user.userId = '';
                                        user.isHost = false;
                                        //่when path have room id
                                        if(roomIdFromPath){
                                            setIsLoading(true)
                                            try{
                                                let resJoinRoom = await addMember( roomIdFromPath , usernameRef.current.value.replaceAll(" ","").replaceAll("-","")) as string[]
                                                await updateUserPicture(resJoinRoom[0],resJoinRoom[1], selectedImage);
                                                setIsLoading(false)
                                                if(resJoinRoom.length === 3 ){
                                                    let user = {} as UserDataType;
                                                    user.username = usernameRef.current.value.replaceAll(" ","").replaceAll("-","");;
                                                    user.profilePicture = selectedImage;
                                                    user.userId = resJoinRoom[0];
                                                    user.isHost = false;
                                                    setUserData(user);
                                                    //******************************
                                                    let room = {} as RoomDataType;
                                                    room.roomname = resJoinRoom[2];
                                                    room.roomId = resJoinRoom[1]
                                                    setRoomData(room)
                                                }else{
                                                    setShowInvalidPin(true)
                                                    setTimeout(()=>setShowInvalidPin(false),2000);
                                                }
                                            }catch(err){
                                                console.log(err);
                                                setUserData(user);
                                                setIsLoading(false)
                                                setTimeout(()=>{setDalayAnimation(true);setCreateOrJoin(0)},700)
                                            }
                                        }else{
                                            setUserData(user);
                                            setTimeout(()=>{setDalayAnimation(true);setCreateOrJoin(0)},700)
                                        }

                                        
                                    }
                                }());
                                
                            }}
                        >
                        <div className="w-full flex justify-start items-center mt-16">
                            <img className="rounded-full w-28 ring-offset-4 ring-4 ring-blue" src={selectedImage}/>
                            <div className="flex flex-col items-start justify-center ml-8 gap-3">
                                <p className="text-blue hover:text-primary-blue-2 text-[18px] font-bold cursor-pointer"
                                    onClick={()=>{
                                        setIsUploadNewPhoto(true)
                                    }}
                                >Upload new photo</p>
                                {isSelectedImage && 
                                <p className="text-secondary-gray-1 hover:text-secondary-gray-2 text-[18px] font-bold cursor-pointer"
                                    onClick={()=>{
                                        setSelectedImage('data:image/png;base64,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')
                                        setIsSelectedImage(false);
                                    }}
                                >Delete photo</p>}
                            </div>
                        </div>
                        <TextField required inputRef={usernameRef} fullWidth variant="outlined" label="Your display name" size={'small'} style={{ marginTop:'40px' }}/>
                    
                        <button type="submit" className={`w-full flex justify-center items-center drop-shadow-lg ${isLoading ? 'bg-primary-blue-2 cursor-default' : 'bg-blue cursor-pointer'} hover:bg-primary-blue-2 duration-200 ease-in text-white font-bold py-2 rounded-md mt-10`}>
                            Continue
                        </button>
                        </form>
                </motion.div> : (
                    delayAnimation &&<>{StateCreateRoom()}</>
                )}
        </AnimatePresence>
        </motion.div>:
        <></>
        }
        </AnimatePresence>
    )
}

export default CreateRoom