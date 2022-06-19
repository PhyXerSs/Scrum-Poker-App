import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { useRecoilState, useRecoilValue } from 'recoil'
import { gameSettingClickState, RoomDataState , UserData } from '../../PokerStateManagement/Atom'

function classNames(...classes : string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PokerMenuDropDown( ) {
    const roomData = useRecoilValue(RoomDataState);
    const [ showGameSetting , setShowGameSetting ] = useRecoilState(gameSettingClickState);
    return (
        <Menu as="div" className="relative text-left w-fit">
            <div>
                <Menu.Button className="flex items-center justify-center w-full rounded-lg shadow-lg px-4 py-2 text-h4 font-semibold text-secondary-gray-1 bg-white hover:bg-secondary-gray-4 ease-in duration-300 focus:outline-none border-none focus:ring-offset-1 focus:ring-2 focus:ring-gray-dark-opa50 ">
                    {roomData.roomname}
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
                <Menu.Items className="absolute -right-18 mt-2 w-56 rounded-md bg-white" style={{boxShadow: 'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px'}}>
                <div>
                    <Menu.Item>
                    {({ active }:any) => (
                        <a
                        href="#"
                        className={`${classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'text-sm'
                        )} flex justify-start items-center hover:bg-primary-blue-3 rounded-t-md px-6 py-3 text-secondary-gray-1 ease-in duration-300`}
                            onClick={()=>{setShowGameSetting(true)}}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-secondary-gray-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>    
                        Room settings
                        </a>
                    )}
                    </Menu.Item>
                </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}