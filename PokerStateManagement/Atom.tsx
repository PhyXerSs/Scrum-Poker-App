import { atom } from 'recoil'

export interface UserDataType{
    username:string;
    profilePicture:string,
    userId:string;
    isHost:boolean;
}


export const UserData = atom({
    key: 'user_Data',
    default: {
        username:'-',
        profilePicture: 'data:image/jpeg;base64,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',
        userId:'-',
        isHost:false,
    } as UserDataType,
    dangerouslyAllowMutability:true
})

export interface RoomDataType{
    roomname:string;
    roomId:string;
}

export const RoomDataState = atom({
    key: 'room_Data',
    default:{
        roomname:'-',
        roomId: '-',
    } as RoomDataType,
    dangerouslyAllowMutability:true
})

export const isReveal = atom({
    key: 'is_Reveal',
    default: 1 as number,
})

export interface PlayerInRoomType{
    id:string,
    name:string,
    vote:string,
    isHost:boolean,
    profilePicture:string
}

export const playersInRoom = atom({
    key: 'all_Player_In_Room',
    default: null as PlayerInRoomType[] | null,
    dangerouslyAllowMutability:true
})



export const issueBarState = atom({
    key:'issue_Bar_State',
    default : false as boolean,
})

export interface issueType{
    title: string,
    score: string,
    selected:boolean,
    id:string,
    idFromDB:string,
    ownerName:string,
    breakdownTime:number,
    votingTime:number,
    issueType:string[],
}

export const issueDataState = atom({
    key:'issue_Data',
    default: [] as issueType[], 
    dangerouslyAllowMutability:true,
})

export const issueSelectedState = atom({
    key:'issue_Selected_State',
    default : {
        title: '-',
        score: '-',
        selected:false,
        id:'-',
        idFromDB:'-',
        ownerName:'-',
        breakdownTime:0,
        votingTime:0,
        issueType:['Other'],
    } as issueType,
    dangerouslyAllowMutability:true,
})

export const syncVotingSequenceState = atom({
    key:'sync_Voting_Sequence_State',
    default: 'fibo' as string
})

export const votingSequenceState = atom({
    key:'voting_Sequence',
    default:[ "0" , "0.5" , "1" , "2" , "3" , "5" , "8" ,"13" , "21" , "34" , "40" , "?" ] as string[],
})

export const issueUpdateState = atom({
    key:'issue_Uppdate_state',
    default: 0 as number
})

export const averageVoteState = atom({
    key : 'average_Vote',
    default: '-' as string,
})

export const invitePopupState = atom({
    key : 'invite_Popup_State',
    default : false as boolean
})

export const gameSettingClickState = atom({
    key : 'game_Setting_Click_State',
    default : false as boolean,
})

export const renameClickState = atom({
    key: 'rename_Click_State',
    default : false as boolean,
})

export interface editIssueType{
    isEditClick:boolean,
    title: string,
    score: string,
    selected:boolean,
    id:string,
    idFromDB:string,
    ownerName:string
    breakdownTime:number,
    votingTime:number,
    issueType:string[],
}

export const editIssueClickState = atom({
    key: 'edit_Issue_Click_State',
    default : {
        isEditClick:false,
        title: '',
        score: '',
        selected:false,
        id:'',
        idFromDB:'',
        ownerName:'',
        breakdownTime:0,
        votingTime:0,
        issueType:[],
    } as editIssueType
})

export const loadingState = atom({ 
    key: 'loading_State',
    default: false as boolean
})

export const localResetVoteState = atom({
    key:'local_Reset_Vote_State',
    default:false as boolean
})

export const isClearingScoreState = atom({
    key:"is_Clearing_Score_State",
    default:false as boolean
})

export interface countDownType{
    initialCountdown :number,
    pause:boolean,
    stop:boolean,
}

export const countdownState = atom({
    key:'countdown_State',
    default:{
        initialCountdown: -1,
        pause:false,
        stop:false,
    } as countDownType,
    dangerouslyAllowMutability:true,
})

export const isShowChangeProfilePictureState = atom({
    key:"is_Show_Change_Profile_Picture_State",
    default:false as boolean
})

export const stateButtonTimeState = atom({
    key:'state_Button_State',
    default: 0 as number,
})

export const timeBreakdownState = atom({
    key:'time_Breakdown_State',
    default: 0 as number,
})

export const timeVotingState = atom({
    key:'time_Voting_State',
    default: 0 as number,
})

export const showFullImageState = atom({
    key: 'show_Full_Image',
    default: '-' as string,
})

export const isUploadNewPhotoState = atom({
    key:'upload_New_Photo_State',
    default:false as boolean
})

export const maxFrontEndPointState = atom({
    key: 'max_Front_End_Point_State',
    default : '0' as string,
})

export const maxBackEndPointState = atom({
    key: 'max_Back_End_Point_State',
    default : '0' as string,
})

export const maxOtherPointState = atom({
    key: 'max_Other_Point_State',
    default : '0' as string,
})