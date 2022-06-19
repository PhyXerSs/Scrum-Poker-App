import { AnimatePresence , motion } from 'framer-motion';
import React from 'react'
import { useRecoilState } from 'recoil'
import { showFullImageState } from '../../PokerStateManagement/Atom'

function FullChatImage() {

    const [ showFullImage , setShowFullImage ] = useRecoilState(showFullImageState);

    return (
        <AnimatePresence>
        {showFullImage !== '-' &&
            <motion.div className="h-screen w-full fixed top-0 left-0  flex justify-center items-center z-50 bg-blue-dark-op50"
                animate={{ opacity: 1 }}
                initial={{opacity : 0  }}
                exit = {{ opacity : 0 }}
                transition={{  duration: 1 }}
            >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 absolute top-2 right-5 p-1 text-white bg-black-opa80 hover:bg-secondary-gray-1 rounded-full duration-200 ease-in hover:cursor-pointer  " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            onClick={()=>{setShowFullImage('-')}}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {showFullImage !== '-' &&
                    <motion.div className="flex flex-col justify-center items-center"
                        animate={{ opacity: 1 , y: 0 }}
                        initial={{opacity : 0 , y:-150 }}
                        exit ={{ opacity : 0 , scale: 0 }}
                        transition={{  duration: 0.8 }}
                    >
                        <img className="max-w-full max-h-screen" src={showFullImage}/> 
                    </motion.div>
                    }
            </motion.div> }
        </AnimatePresence>
    )
}

export default FullChatImage