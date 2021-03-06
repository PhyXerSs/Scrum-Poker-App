import '../styles/globals.css'
import type { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css';
// import '../styles/globals.css'
import "../components/PokerComponents/PokerFooter.css"
import "../components/PokerComponents/AlertUserEvent.css"
import "../components/PokerComponents/RoomChat.css"
import Head from 'next/head'
function MyApp({ Component, pageProps }: AppProps) {
  return ( 
    <>
      <Head>
          <title>Scrum Poker</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/static/images/bg/Group 1.png" />
      </Head>
      <Component {...pageProps} /> 
    </>
    
  )
}

export default MyApp
