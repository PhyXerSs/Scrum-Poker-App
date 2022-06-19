import { AnimatePresence , motion } from 'framer-motion';
import React, { useRef } from 'react'
import TextField from '@mui/material/TextField';
import { useRecoilState, useRecoilValue } from 'recoil';
import { renameClickState, RoomDataState, UserData, UserDataType } from '../../PokerStateManagement/Atom';
import { changeName } from '../../pages/api/PokerAPI/api';
function Rename() {
    const renameRef = useRef<HTMLInputElement>(null)
    const [ isRenameClick , setIsRenameClick ] = useRecoilState(renameClickState);
    const roomData = useRecoilValue(RoomDataState);
    const [ userData , setUserData ] = useRecoilState(UserData);
    
    return (
        <AnimatePresence>
            {isRenameClick &&
            <motion.div className="h-screen w-full fixed top-0 left-0  flex justify-center items-center z-50 bg-blue-dark-op50 "
                animate={{ opacity: 1 }}
                initial={{opacity : 0  }}
                exit = {{ opacity : 0 }}
                transition={{  duration: 1 }}
            >{isRenameClick&&
                <motion.div className="flex flex-col justify-center items-start w-full max-w-xl bg-white py-10 px-8 rounded-3xl relative"
                            animate={{ opacity: 1 , y: 0 ,rotateX:0}}
                            initial={{opacity : 0 , y:-150 , rotateX:90}}
                            exit ={{ opacity : 0 ,scale:0 , rotateX:90}}
                            transition={{  duration: 0.7 }}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 absolute top-2 right-2 p-1 text-secondary-gray-2 rounded-full duration-200 ease-in hover:cursor-pointer hover:bg-secondary-gray-3 hover:text-white " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                onClick={()=>{setIsRenameClick(false)}}
                        >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="font-bold text-h4 text-gray"> Change your display name</p>
                        <form  className="w-full h-fit" 
                            onSubmit={(e)=>{
                                    (async function(){
                                        try{
                                            if(renameRef.current !== null && renameRef.current.value !== ''){
                                                await changeName(roomData.roomId , userData.userId ,renameRef.current.value.replaceAll(" ","").replaceAll("-",""))
                                                let user = {} as UserDataType;
                                                user.username = renameRef.current?.value.replaceAll(" ","").replaceAll("-","");
                                                user.profilePicture = userData.profilePicture;
                                                user.userId = userData.userId;
                                                user.isHost = userData.isHost;
                                                setUserData(user);
                                                renameRef.current.value = '';
                                                setIsRenameClick(false)
                                            }
                                        }catch(err){
                                            console.log(err);
                                        }
                                    }())
                                e.preventDefault();
                            }}
                        >
                            <TextField required inputRef={renameRef} defaultValue={userData.username} fullWidth variant="outlined" label="new display name" size={'small'} style={{ marginTop:'60px' }}/>
                        
                            <button type="submit" className="w-full flex justify-center items-center drop-shadow-lg bg-blue hover:cursor-pointer hover:bg-primary-blue-2 duration-200 ease-in text-white font-bold py-2 rounded-md mt-5">
                                Confirm
                            </button>
                        </form>
                </motion.div>}
            </motion.div>}
        </AnimatePresence>
    )
}

export default Rename