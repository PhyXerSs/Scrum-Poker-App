import React, { useEffect, useRef, useState , UIEvent } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil';
import { playersInRoom, RoomDataState, showFullImageState, UserData } from '../../PokerStateManagement/Atom';
import SendIcon from '@mui/icons-material/Send';
import firebase from '../../firebase/firebase-config';
import { sendMessage } from '../../pages/api/PokerAPI/api';
import { Anchorme, LinkComponentProps } from 'react-anchorme'
import { AnimatePresence ,motion} from 'framer-motion';
import GroupIcon from '@mui/icons-material/Group';
import Resizer from "react-image-file-resizer";
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
interface chatMessageType{
    memberId:string,
    name:string,
    message:string,
    timeStamp:number,
    profilePicture:string,
    imageUrl:string
}

function RoomChat() {
    const [ showRoomChat , setShowRoomChat ] = useState<boolean>(false);
    const [ chatMessage , setChatMessage ] = useState<chatMessageType[]>([]);
    const allPlayerInRoom = useRecoilValue(playersInRoom);
    const roomData = useRecoilValue(RoomDataState);
    const inputMessageRef = useRef<HTMLTextAreaElement>(null);
    const [ resetInputBox , setResetInputBox ] = useState<boolean>(false);
    const dummyRef = useRef<HTMLSpanElement>(null);
    const userData = useRecoilValue(UserData);
    const [isScrollBottom, setIsScrollBottom] = useState<boolean>(true);
    const [ countMessageAlert , setCountMessageAlert ] = useState<number>(0);
    const [ countMessageBeforeRead , setCountMessageBeforeRead ] = useState<number>(0);
    const [ IsReadNewMessage , setIsReadNewMessage ] = useState<boolean>(false);
    const [ hoverMessage , setHoverMessage ] = useState<number>(-1);
    const [ previewImage , setPreviewImage ] = useState<string>('-');
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [ showFullImage , setShowFullImage ] = useRecoilState(showFullImageState);

    let unsubRoomMessage = () => {}
    useEffect(()=>{
        const tx = document.getElementsByTagName("textarea");
        for (let i = 0; i < tx.length; i++) {
            tx[i].setAttribute("style", "height:" + 24 + "px;overflow-y:auto;resize:none;max-height: 4rem");
            tx[i].addEventListener("input", OnInput, false);
        }
        function OnInput(e:any) {
            e.target.style.height = "auto";
            e.target.style.height = (e.target.scrollHeight) + "px";
        }
    },[showRoomChat,resetInputBox])

    useEffect(()=>{
        let messageBody = document.querySelector('#messageBody');
        if(messageBody !== null){
            messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
            setIsScrollBottom(true)
        }
    },[showRoomChat])

    useEffect(()=>{
        unsubRoomMessage = firebase.firestore().collection('poker').doc(roomData.roomId).collection('chat')
            .onSnapshot(async(docs)=>{
                console.log(docs);
                
                let roomMessage = [] as chatMessageType[];
                docs.forEach((doc)=>{
                    let messageResult = {} as chatMessageType;
                    messageResult.memberId = doc.data()?.memberId;
                    messageResult.message = doc.data()?.message;
                    messageResult.name = doc.data()?.name;
                    messageResult.profilePicture = doc.data()?.profilePicture;
                    messageResult.timeStamp = doc.data()?.timestamp;
                    messageResult.imageUrl = doc.data()?.imageUrl;
                    roomMessage.push(messageResult);
                })
                setChatMessage(roomMessage);
            })
        return ()=>{unsubRoomMessage(); setCountMessageBeforeRead(0); setCountMessageAlert(0); setShowRoomChat(false)}
    },[roomData])

    useEffect(()=>{
        if(isScrollBottom){
            dummyRef.current?.scrollIntoView({ behavior: 'smooth' , block: 'nearest', inline: 'start'});
        }
    },[chatMessage ,isScrollBottom , allPlayerInRoom])

    useEffect(()=>{
        if(userData !== null && chatMessage[chatMessage?.length - 1]?.memberId === userData.userId ){
            let messageBody = document.querySelector('#messageBody');
            if(messageBody !== null){
                if(messageBody.scrollHeight > 3000 && messageBody.scrollTop < messageBody.scrollHeight -3000){
                    dummyRef.current?.scrollIntoView({ behavior: 'auto' , block: 'nearest', inline: 'start' });
                }else{
                    dummyRef.current?.scrollIntoView({ behavior: 'smooth' , block: 'nearest', inline: 'start' });
                }
            }
        }
    },[chatMessage,userData])
    
    useEffect(()=>{
        if(showRoomChat && countMessageBeforeRead !== chatMessage.length){
            setCountMessageAlert(0);
            setCountMessageBeforeRead(chatMessage.length);
        }
        if(!showRoomChat){
            setIsReadNewMessage(false);
            setCountMessageAlert(chatMessage.length - countMessageBeforeRead);
        }
    },[chatMessage,showRoomChat,countMessageBeforeRead])

    useEffect(()=>{
        if(countMessageBeforeRead !== chatMessage.length){
            setIsReadNewMessage(true)
        } 
        if(isScrollBottom && countMessageBeforeRead === chatMessage.length){
            setIsReadNewMessage(false)
        }
    },[chatMessage,countMessageBeforeRead,isScrollBottom])

    function renderMemberChatMessage(chat:chatMessageType , index:number){

        if(index === 0){
            if(index === chatMessage?.length-1){
                return(
                    <div className='flex flex-col ml-1 mt-5 relative mb-4'>
                        <div className="flex items-end">
                            <img className="w-7 h-7 flex items-center justify-center mr-[6px] rounded-2xl" src={chat.profilePicture}/>  
                            <div id="message_bubble" className="py-[6px] px-3 rounded-l-3xl rounded-r-3xl max-w-[200px] break-words member-bubble relative"
                                onMouseEnter={()=>setHoverMessage(index)}
                                onMouseLeave={()=>setHoverMessage(-1)}
                            >
                                <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                                
                                {chat.imageUrl !== '-' &&
                                    <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                        onClick={()=>{setShowFullImage(chat.imageUrl)}}
                                    />}
                                
                                <div className='absolute -right-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                                    <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                                </div>
                            </div>
                        </div>
                        <p className={`w-fit min-w-[30px] max-w-[64px] absolute -bottom-3 text-center text-h5 text-secondary-gray-3 overflow-hidden whitespace-nowrap`}>{chat.name}</p>
                    </div>
                );
            }
            if(chatMessage[index + 1].memberId !== chatMessage[index].memberId){
                return(
                    <div className='flex flex-col ml-1 mt-5 mb-4 relative'>
                        <div className="flex items-end ">
                            <img className="w-7 h-7 flex items-center justify-center mr-[6px] rounded-2xl" src={chat.profilePicture}/>  
                            <div id="message_bubble" className="py-[6px] px-3 rounded-l-3xl rounded-r-3xl max-w-[200px] break-words member-bubble relative"
                                onMouseEnter={()=>setHoverMessage(index)}
                                onMouseLeave={()=>setHoverMessage(-1)}
                            >
                                <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                                
                                {chat.imageUrl !== '-' &&
                                    <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                        onClick={()=>{setShowFullImage(chat.imageUrl)}}
                                    />}
                                
                                <div className='absolute -right-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                                    <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                                </div>
                            </div>
                        </div>
                        <p className={`w-fit min-w-[30px] max-w-[64px] absolute -bottom-3 text-center text-h5 text-secondary-gray-3 overflow-hidden whitespace-nowrap`}>{chat.name}</p>
                    </div>
                ); 
            }
            return(
                <div className="flex items-end ml-1 mt-5">
                    <div className='w-7 h-7 mr-[6px]'>
                    </div>
                    <div id="message_bubble" className="py-[6px] px-3 rounded-r-3xl rounded-tl-3xl rounded-bl-md max-w-[200px] break-words member-bubble mr-3 relative"
                        onMouseEnter={()=>setHoverMessage(index)}
                        onMouseLeave={()=>setHoverMessage(-1)}
                    >
                        <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                        
                        {chat.imageUrl !== '-' &&
                            <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                onClick={()=>{setShowFullImage(chat.imageUrl)}}
                            />}
                        
                        <div className='absolute -right-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                            <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                        </div>
                    </div>
                </div>
            );
        }else if( index === chatMessage?.length - 1 ){
            if(chatMessage[index - 1]?.memberId !== chatMessage[index]?.memberId){
                return(
                    <div className='flex flex-col ml-1 mb-4 relative'>
                        <div className="flex items-end">
                            <img className="w-7 h-7 flex items-center justify-center mr-[6px] rounded-2xl" src={chat.profilePicture}/>  
                            <div id="message_bubble" className="py-[6px] px-3 rounded-l-3xl rounded-r-3xl max-w-[200px] break-words member-bubble mr-3 relative"
                                onMouseEnter={()=>setHoverMessage(index)}
                                onMouseLeave={()=>setHoverMessage(-1)}
                            >
                                <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                                
                                {chat.imageUrl !== '-' &&
                                    <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                        onClick={()=>{setShowFullImage(chat.imageUrl)}}
                                    />}
                                
                                <div className='absolute -right-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                                    <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                                </div>
                            </div>
                        </div>
                        <p className={`w-fit min-w-[30px] max-w-[64px] absolute -bottom-3 text-center text-h5 text-secondary-gray-3 overflow-hidden whitespace-nowrap`}>{chat.name}</p>
                    </div>
                );
            }
            return(
                <div className='flex flex-col ml-1 mb-4 relative'>
                    <div className="flex items-end">
                        <img className="w-7 h-7 flex items-center justify-center mr-[6px] rounded-2xl" src={chat.profilePicture}/>  
                        <div id="message_bubble" className="py-[6px] px-3 rounded-r-3xl rounded-tl-md rounded-bl-3xl max-w-[200px] break-words member-bubble mr-3 relative"
                            onMouseEnter={()=>setHoverMessage(index)}
                            onMouseLeave={()=>setHoverMessage(-1)}
                        >
                            <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                            
                            {chat.imageUrl !== '-' &&
                                <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                    onClick={()=>{setShowFullImage(chat.imageUrl)}}
                                />}
                            
                            <div className='absolute -right-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                                <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                            </div>
                        </div>
                    </div>
                    <p className={`w-fit min-w-[30px] max-w-[64px] absolute -bottom-3 text-center text-h5 text-secondary-gray-3 overflow-hidden whitespace-nowrap`}>{chat.name}</p>
                </div>
            );
        }else{
            if(chatMessage[index - 1]?.memberId !== chatMessage[index]?.memberId && chatMessage[index + 1]?.memberId !== chatMessage[index]?.memberId){
                return (
                    <div className='flex flex-col ml-1 mb-4 relative'>
                        <div className="flex items-end">
                            <img className="w-7 h-7 flex items-center justify-center mr-[6px] rounded-2xl" src={chat.profilePicture}/>  
                            <div id="message_bubble" className="py-[6px] px-3 rounded-l-3xl rounded-r-3xl max-w-[200px] break-words member-bubble mr-3 relative"
                                onMouseEnter={()=>setHoverMessage(index)}
                                onMouseLeave={()=>setHoverMessage(-1)}
                            >
                                <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                                
                                {chat.imageUrl !== '-' &&
                                    <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                        onClick={()=>{setShowFullImage(chat.imageUrl)}}
                                    />}
                                
                                <div className='absolute -right-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                                    <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                                </div>
                            </div>     
                        </div>
                        <p className={`w-fit min-w-[30px] max-w-[64px] absolute -bottom-3 text-center text-h5 text-secondary-gray-3 overflow-hidden whitespace-nowrap`}>{chat.name}</p>
                    </div>
                );
            }
            if(chatMessage[index - 1]?.memberId !== chatMessage[index]?.memberId){
                return (
                    <div className="flex items-end ml-1">
                        <div className='w-7 h-7 mr-[6px]'>
                        </div>
                        <div id="message_bubble" className="py-[6px] px-3 rounded-r-3xl rounded-tl-3xl rounded-bl-md max-w-[200px] break-words member-bubble mr-3 relative" 
                            onMouseEnter={()=>setHoverMessage(index)}
                            onMouseLeave={()=>setHoverMessage(-1)}
                        >
                            <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                            
                            {chat.imageUrl !== '-' &&
                                <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                    onClick={()=>{setShowFullImage(chat.imageUrl)}}
                                />}
                            
                            <div className='absolute -right-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                                <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                            </div>
                        </div>
                    </div>
                );
            }
            
            if(chatMessage[index - 1]?.memberId === chatMessage[index]?.memberId){

                if(chatMessage[index + 1]?.memberId === chatMessage[index]?.memberId){
                    return(
                        <div className="flex items-end ml-1">
                            <div className='w-7 h-7 mr-[6px]'>
                            </div>
                            <div id="message_bubble" className="py-[6px] px-3 rounded-r-3xl rounded-l-md max-w-[200px] break-words member-bubble mr-3 relative"
                                onMouseEnter={()=>setHoverMessage(index)}
                                onMouseLeave={()=>setHoverMessage(-1)}
                            >
                                <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                                
                                {chat.imageUrl !== '-' &&
                                    <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                        onClick={()=>{setShowFullImage(chat.imageUrl)}}
                                    />}
                                
                                <div className='absolute -right-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                                    <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                                </div>
                            </div>
                        </div>
                    );
                }else{
                    return(
                        <div className='flex flex-col ml-1 mb-4 relative'>
                            <div className="flex items-end">
                                <img className="w-7 h-7 flex items-center justify-center mr-[6px] rounded-2xl" src={chat.profilePicture}/> 
                                <div id="message_bubble" className="py-[6px] px-3 rounded-r-3xl rounded-tl-md rounded-bl-3xl max-w-[200px] break-words member-bubble mr-3 relative"
                                    onMouseEnter={()=>setHoverMessage(index)}
                                    onMouseLeave={()=>setHoverMessage(-1)}
                                >
                                    <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                                    
                                    {chat.imageUrl !== '-' &&
                                        <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                            onClick={()=>{setShowFullImage(chat.imageUrl)}}
                                        />}
                                    
                                    <div className='absolute -right-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                                        <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                                    </div>
                                </div>
                            </div>
                            <p className={`w-fit min-w-[30px] max-w-[64px] absolute -bottom-3 text-center text-h5 text-secondary-gray-3 overflow-hidden whitespace-nowrap`}>{chat.name}</p>
                        </div>
                    );
                }
            }
        } 
    }


    function renderOwnerChatMessage(chat:chatMessageType , index:number){
        
        if(index === 0){
            if(index === chatMessage?.length-1){
                return(
                    <div id="owner_message_buble" className="py-[6px] px-3 rounded-l-3xl rounded-r-3xl max-w-[240px] break-words owner-bubble mr-1 mt-5 relative" 
                        onMouseEnter={()=>setHoverMessage(index)}
                        onMouseLeave={()=>setHoverMessage(-1)}
                    >
                        <p className="text-white">{chat?.message}</p>
                        
                        {chat.imageUrl !== '-' &&
                            <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                onClick={()=>{setShowFullImage(chat.imageUrl)}}
                            />}
                        
                        <div className='absolute -left-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                            <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                        </div>
                    </div>
                );
            }
            if(chatMessage[index + 1].memberId !== chatMessage[index].memberId){
                return(
                    <div id="owner_message_buble" className="py-[6px] px-3 rounded-l-3xl rounded-r-3xl max-w-[240px] break-words owner-bubble mr-1 mt-5 mb-2 relative"
                        onMouseEnter={()=>setHoverMessage(index)}
                        onMouseLeave={()=>setHoverMessage(-1)}
                    >
                        <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                        
                        {chat.imageUrl !== '-' &&
                            <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                onClick={()=>{setShowFullImage(chat.imageUrl)}}
                            />}
                        
                        <div className='absolute -left-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                            <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                        </div>
                    </div>
                );
            }
            return(
                <div id="owner_message_buble" className="py-[6px] px-3 rounded-l-3xl rounded-tr-3xl rounded-br-md max-w-[240px] break-words owner-bubble mr-1 mt-5 relative"
                    onMouseEnter={()=>setHoverMessage(index)}
                    onMouseLeave={()=>setHoverMessage(-1)}
                >
                    <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                    
                    {chat.imageUrl !== '-' &&
                        <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                            onClick={()=>{setShowFullImage(chat.imageUrl)}}
                        />}
                    
                    <div className='absolute -left-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                        <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                    </div>
                </div>
            );
        }else if( index === chatMessage?.length - 1 ){
            if(chatMessage[index - 1]?.memberId !== chatMessage[index]?.memberId){
                return(
                    <div id="owner_message_buble" className="py-[6px] px-3 rounded-l-3xl rounded-r-3xl max-w-[240px] break-words owner-bubble mr-1 mb-1 relative"
                        onMouseEnter={()=>setHoverMessage(index)}
                        onMouseLeave={()=>setHoverMessage(-1)}
                    >
                        <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                        
                        {chat.imageUrl !== '-' &&
                            <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                onClick={()=>{setShowFullImage(chat.imageUrl)}}
                            />}
                        
                        <div className='absolute -left-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                            <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                        </div>
                    </div>
                );
            }
            return(
                <div id="owner_message_buble" className="py-[6px] px-3 rounded-l-3xl rounded-tr-md rounded-br-3xl max-w-[240px] break-words owner-bubble mr-1 mb-1 relative"
                    onMouseEnter={()=>setHoverMessage(index)}
                    onMouseLeave={()=>setHoverMessage(-1)}
                >
                    <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                    
                    {chat.imageUrl !== '-' &&
                        <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                            onClick={()=>{setShowFullImage(chat.imageUrl)}}
                        />}
                    
                    <div className='absolute -left-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                        <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                    </div>
                </div>
            );
        }else{
            if(chatMessage[index - 1]?.memberId !== chatMessage[index]?.memberId && chatMessage[index + 1]?.memberId !== chatMessage[index]?.memberId){
                return (
                    <div id="owner_message_buble" className="py-[6px] px-3 rounded-l-3xl rounded-r-3xl max-w-[240px] break-words owner-bubble mr-1 mb-2 relative"
                        onMouseEnter={()=>setHoverMessage(index)}
                        onMouseLeave={()=>setHoverMessage(-1)}
                    >
                        <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                        
                        {chat.imageUrl !== '-' &&
                            <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                onClick={()=>{setShowFullImage(chat.imageUrl)}}
                            />}
                        
                        <div className='absolute -left-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                            <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                        </div>
                    </div>
                );
            }
            if(chatMessage[index - 1]?.memberId !== chatMessage[index]?.memberId){
                return (
                    <div id="owner_message_buble" className="py-[6px] px-3 rounded-l-3xl rounded-tr-3xl rounded-br-md max-w-[240px] break-words owner-bubble mr-1 relative"
                        onMouseEnter={()=>setHoverMessage(index)}
                        onMouseLeave={()=>setHoverMessage(-1)}
                    >
                        <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                        
                        {chat.imageUrl !== '-' &&
                            <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                onClick={()=>{setShowFullImage(chat.imageUrl)}}
                            />}

                        <div className='absolute -left-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                            <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                        </div>
                    </div>
                );
            }
            
            if(chatMessage[index - 1]?.memberId === chatMessage[index]?.memberId){

                if(chatMessage[index + 1]?.memberId === chatMessage[index]?.memberId){
                    return(
                        <div id="owner_message_buble" className="py-[6px] px-3 rounded-l-3xl rounded-r-md max-w-[240px] break-words owner-bubble mr-1 relative"
                            onMouseEnter={()=>setHoverMessage(index)}
                            onMouseLeave={()=>setHoverMessage(-1)}
                        >
                            <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                            
                            {chat.imageUrl !== '-' &&
                                <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                    onClick={()=>{setShowFullImage(chat.imageUrl)}}
                                />}
                            
                            <div className='absolute -left-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                                <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                            </div>
                        </div>
                    );
                }else{
                    return(
                        <div id="owner_message_buble" className="py-[6px] px-3 rounded-l-3xl rounded-tr-md rounded-br-3xl max-w-[240px] break-words owner-bubble mr-1 mb-2 relative"
                            onMouseEnter={()=>setHoverMessage(index)}
                            onMouseLeave={()=>setHoverMessage(-1)}
                        >
                            <p className="text-white"><Anchorme linkComponent={CustomLink} target="_blank" rel="noreferrer noopener">{chat?.message}</Anchorme></p>
                            
                            {chat.imageUrl !== '-' &&
                                <img className="max-w-full rounded-2xl cursor-pointer my-1" src={chat.imageUrl}
                                    onClick={()=>{setShowFullImage(chat.imageUrl)}}
                                />}
                            
                            <div className='absolute -left-14 top-0 w-fit justify-center items-center px-2 py-1 bg-black-opa80 rounded-lg' style={{display: hoverMessage === index ? 'flex' : 'none' }}>
                                <p className="text-white">{convertSecondToDate(chat?.timeStamp)}</p>
                            </div>
                        </div>
                    );
                }
            }
            
        }     
    }

    const CustomLink = (props: LinkComponentProps) => {
        return (
            <a className="text-white underline" {...props} />
        )
      }

    function convertSecondToDate(second:number){        
        let dateTime =new Date(second).toTimeString().slice(0,5);
        return dateTime;
    }

    function convertFileToImage(file:File){
        try {
          Resizer.imageFileResizer(
            file,
            1000,
            1000,
            "JPEG",
            150,
            0,
            (uri) => {
              let data = uri as string;
              console.log(data);
              
              setPreviewImage(data)
            },
            "Blob"
          );
        } catch (err) {
          console.log(err);
        }
    }

    return (

        <>
            <div className='rounded-full flex justify-center items-center w-14 h-14 fixed right-4 sm:right-10 bottom-[40px] z-[1] bg-primary-blue-3 drop-shadow-lg cursor-pointer'
                onClick={()=>setShowRoomChat(!showRoomChat)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-primary-blue-2 hover:text-tertiary-light-sky-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                { !showRoomChat && countMessageAlert > 0 &&
                <div className="absolute h-6 w-6 -top-1 -right-1 flex items-center justify-center rounded-full p-2" style={{backgroundColor:'rgb(242, 95, 127)'}}>
                    <p className="text-white">{countMessageAlert}</p>
                </div>}
            </div>
            
            {showRoomChat &&
                <div className={`fixed right-4 sm:right-10 bottom-[120px] w-[320px] h-[450px] z-[1] flex flex-col items-center justify-start drop-shadow-lg bg-white rounded-lg`}>
                    <div className="absolute top-0 flex w-full justify-between items-center bg-primary-blue-2 py-2 rounded-t-lg">
                        <div className='flex items-center ml-5 gap-2'>
                            <GroupIcon fontSize="large" style={{color:'white'}}/>
                            <p className="text-white font-semibold" style={{fontSize:'18px'}}>{roomData.roomname}</p>
                        </div>
                        
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 p-1 mr-2 text-white rounded-full duration-200 ease-in hover:cursor-pointer hover:bg-secondary-gray-3 hover:text-white " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                onClick={()=>setShowRoomChat(false)}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div className='absolute bottom-0 py-[10px] w-full flex items-center justify-start bg-primary-blue-2 rounded-b-lg z-[2]'>
                        <label  >
                            <PhotoLibraryIcon className="hover:bg-primary-blue-1 rounded-2xl p-1 ml-2 cursor-pointer" style={{color:'rgb(232 243 255 / var(--tw-bg-opacity))', fontSize:'30px'}}/>
                            <input ref={inputFileRef} type="file" className="hidden" accept="image/*"
                                onChange={(e)=>{
                                    if (e.target.files !== null && e.target.files.length > 0){
                                        convertFileToImage(e.target.files[0]);
                                    }
                                    e.target.value = ''
                                }}
                            />
                        </label>
                        <div className="w-[230px] rounded-2xl py-1 flex items-center justify-start ml-2 bg-primary-blue-3">
                            
                            <textarea rows={1} className="w-[200px] outline-none bg-transparent ml-4 items-center" placeholder="type a message..." style={{resize:'none'}}
                                ref={inputMessageRef}
                                onKeyPress={async(e)=>{
                                    if(e.key === 'Enter'){
                                        e.preventDefault();
                                        if(allPlayerInRoom !== null && inputMessageRef.current !== null && (inputMessageRef.current.value !== '' || previewImage !== '-' )){
                                            let profilePicture : string;
                                            if(allPlayerInRoom[0].profilePicture === '-'){
                                                profilePicture = userData?.profilePicture;
                                            }else{
                                                profilePicture = allPlayerInRoom[0].profilePicture;
                                            }
                                            sendMessage(roomData.roomId ,allPlayerInRoom[0].id , inputMessageRef.current.value , allPlayerInRoom[0].name , profilePicture ,previewImage );
                                            inputMessageRef.current.value = '';
                                            setResetInputBox(!resetInputBox);
                                            setPreviewImage('-')
                                        }
                                    }
                                }}
                                onPaste={(e)=>{
                                    if(e.clipboardData.files.length > 0 && inputFileRef.current !== null){
                                        inputFileRef.current.files = e.clipboardData.files;
                                        if(e.clipboardData.files[0].type.startsWith("image/")){
                                            convertFileToImage(inputFileRef.current.files[0])
                                        }
                                    }
                                }}
                            ></textarea>
                        </div>
                        <div className=" rounded-full ml-2 hover:cursor-pointer"
                            onClick={async()=>{
                                if(allPlayerInRoom !== null && inputMessageRef.current !== null && ( inputMessageRef.current.value !== '' || previewImage !== '-' ) ){
                                    let profilePicture : string;
                                    if(allPlayerInRoom[0].profilePicture === '-'){
                                        profilePicture = userData?.profilePicture;
                                    }else{
                                        profilePicture = allPlayerInRoom[0].profilePicture;
                                    }
                                    sendMessage( roomData.roomId , allPlayerInRoom[0].id , inputMessageRef.current.value , allPlayerInRoom[0].name , profilePicture , previewImage );
                                    inputMessageRef.current.value = '';
                                    setResetInputBox(!resetInputBox);
                                    setPreviewImage('-');
                                }
                            }}
                        >
                            <SendIcon style={{color:'rgb(232 243 255 / var(--tw-bg-opacity))'}}/>
                        </div>

                        {IsReadNewMessage && 
                        <motion.div className="absolute -top-[22px] py-1 w-full flex justify-center items-center rounded-t-lg bg-blue hover:bg-primary-blue-3 text-white hover:text-blue cursor-pointer duration-200 ease-in z-[1]" 
                            animate={{ opacity: 1 }}
                            initial={{opacity : 0  }}
                            transition={{  duration: 1.2 }}
                            onClick={()=>{
                                dummyRef.current?.scrollIntoView({ behavior: 'smooth' , block: 'nearest', inline: 'start' });
                            }}
                        >
                            <p className="text-h5 font-semibold">New message...</p>
                        </motion.div>}
                        
                        {previewImage !== '-' &&
                        <div className="absolute -top-[100px] left-[40px] rounded-xl w-24 h-24 drop-shadow-md" style={{backgroundImage:`url(${previewImage})` , backgroundSize:'cover' , backgroundRepeat:'no-repeat' ,backgroundPosition:'center'}}>
                            <div onClick={()=>setPreviewImage('-')}>
                                <CancelIcon className="absolute -top-2 -right-2 cursor-pointer text-blue hover:text-primary-blue-2 bg-white rounded-full" />
                            </div>
                        </div>
                        }
                    </div>

                    

                    <div className="flex flex-col w-full h-[354px] mt-[48px] overflow-y-auto gap-[2px] justify-start items-center bg-white relative"
                        id="messageBody"
                        onScroll={(e:any)=>{
                            e.preventDefault();
                            e.stopPropagation();
                            if(e.target.scrollTop + e.target.clientHeight === e.target.scrollHeight){
                                setIsScrollBottom(true)
                            }else{
                                setIsScrollBottom(false)
                            }
                        }}
                    >
                        <AnimatePresence>
                            {chatMessage.length === 0 &&
                            <motion.div className='absolute top-[40px] w-full flex flex-col justify-center items-center'
                                animate={{ opacity: 1 , y : 0}}
                                initial={{opacity : 0 , y : 20 }}
                                exit = {{ opacity : 0 , y : -20}}
                                transition={{  duration: 1 }}
                            >
                                <img src={'/static/images/loading/cxGo.gif'}/>
                                <p className="text-gray-tab font-semibold">Welcome to Chat Room</p>
                            </motion.div>}
                        </AnimatePresence>
                        {
                            allPlayerInRoom && chatMessage?.map((chat,index)=>{
                                
                                if(chat.memberId === allPlayerInRoom[0]?.id){
                                    return(
                                        <div key={chat.memberId + index + chat.timeStamp} className="w-full flex items-center justify-end">
                                            {renderOwnerChatMessage(chat , index)}     
                                        </div>
                                    );
                                }else{
                                    return(
                                        <div key={chat.memberId + index + chat.timeStamp} className="w-full flex items-center justify-start">
                                            {renderMemberChatMessage(chat , index)}
                                        </div>
                                    );
                                } 
                                
                            })
                        }
                        
                        <span ref={dummyRef}></span>
                    </div>
                    
                </div>
                
            }
        </>
    )
}

export default RoomChat