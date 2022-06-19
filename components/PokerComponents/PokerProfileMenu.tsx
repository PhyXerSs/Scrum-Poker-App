import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useRecoilState, useRecoilValue } from 'recoil'
import { averageVoteState, isShowChangeProfilePictureState, issueDataState, issueUpdateState, playersInRoom, renameClickState, RoomDataState , RoomDataType, UserData, UserDataType } from '../../PokerStateManagement/Atom'
import { updateAverageVote } from '../../pages/api/PokerAPI/api'
import firebase from '../../firebase/firebase-config'
import { useRouter } from "next/router"

function classNames(...classes : string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PokerProfileMenuDropDown( ) {
    const [userData , setUserData] = useRecoilState(UserData);
    const [roomData , setRoomData ] = useRecoilState(RoomDataState);
    const allPlayerInRoom = useRecoilValue(playersInRoom);
    const [ isRenameClick , setIsRenameClick ] = useRecoilState(renameClickState);
    const [ averageVote , setAverageVote ] = useRecoilState(averageVoteState);
    const [ issueUpdate , setIssueUpdate ] = useRecoilState(issueUpdateState);
    const [ issueData , setIssueData ] = useRecoilState(issueDataState);
    const [ isShowChangeProfilePicture , setIsShowChangeProfilePicture ] = useRecoilState(isShowChangeProfilePictureState);
    const router = useRouter();

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="flex items-center justify-center w-full rounded-lg shadow-lg px-4 py-2 text-h4 font-semibold text-secondary-gray-1 bg-white hover:bg-secondary-gray-4 ease-in duration-300 focus:outline-none border-none focus:ring-offset-1 focus:ring-2 focus:ring-gray-dark-opa50 ">     
                    <img className="w-8 flex items-center justify-center mr-3 rounded-2xl ring-2 ring-offset-2 ring-blue" src={userData.profilePicture}/>        
                    <p className="text-secondary-gray-1">{userData.username}</p>
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
                <Menu.Items className="absolute -right-0 mt-2 w-56 rounded-md bg-white divide-y divide-secondary-gray-3" style={{boxShadow: 'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px'}}>
                <div>
                    <Menu.Item>
                    {({ active }:any) => (
                        <a
                        href="#"
                        className={`${classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'text-sm'
                        )} flex justify-start items-center rounded-t-md px-6 py-6 cursor-default`}
                        >
                        <div className="relative w-fit"
                            onClick={()=>{setIsShowChangeProfilePicture(true)}}
                        >
                            <img className="w-10 h-10 flex items-center justify-center mr-6 rounded-full ring-2 ring-offset-2 ring-blue relative cursor-pointer hover:ring-offset-blue ease-in duration-300" src={userData.profilePicture}/> 
                            <svg xmlns="http://www.w3.org/2000/svg" style={{backgroundColor:'#cee4ff'}} className="cursor-pointer w-5 p-1 rounded-full absolute -left-1 -bottom-1 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div className="flex flex-col items-start justify-center">
                            <div className="cursor-pointer flex items-center justify-center"
                                onClick={()=>setIsRenameClick(true)}
                            >
                                <p className="font-semibold mr-1 w-fit overflow-hidden" style={{maxWidth:'80px'}}>{userData.username}</p>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <p className="font-normal text-h5 text-gray-opa54">Guest User</p>
                        </div>
                        </a>
                    )}
                    </Menu.Item>
                </div>
                <div>
                    <Menu.Item>
                    {({ active }:any) => (
                        <a
                        href="#"
                        className={`${classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'text-sm'
                        )} flex justify-start items-center hover:bg-primary-blue-3 rounded-b-md px-6 py-3 text-secondary-gray-1 ease-in duration-300`}
                        onClick={async()=>{
                            try{           
                                firebase.database().ref(`poker/status/${userData?.userId}`).set("offline")                          
                                let room = {} as RoomDataType;
                                room.roomname = '-';
                                room.roomId = '-'
                                setRoomData(room);
                                let user = {} as UserDataType;
                                user.username = '-';
                                user.profilePicture = '/static/images/bg/Group 1@3x.png';
                                user.userId = '-';
                                setUserData(user);
                                router.push(`/poker#`);
                            }catch(err){
                                console.log(err);
                            }
                        }}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-secondary-gray-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Leave
                        </a>
                    )}
                    </Menu.Item> 
                </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}