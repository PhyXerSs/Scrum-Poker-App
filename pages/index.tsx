import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const router = useRouter();
  useEffect(()=>{
    router.push('/poker')
  },[])
  return (
    <div className={styles.container}>
    </div>
  )
}

export default Home
