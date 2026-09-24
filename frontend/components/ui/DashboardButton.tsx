'use client'

import { useAppSelector } from "@/redux/hooks"
import Link  from "next/link"

export default function DashboardButton(){
  const user = useAppSelector((state) => state.auth)
  
  if(user.role === 'PROVIDER'){
    return <Link href="/dashboard/provider">dashboard</Link>
  }
  else if(user.role === 'ADMIN'){
    return <Link href="/dashboard/admin">dashboard</Link>
  }
  else if(user.role=='USER'){
    return <Link href="/dashboard/user">dashboard</Link>
  }

  else{
    return null
  }

}   