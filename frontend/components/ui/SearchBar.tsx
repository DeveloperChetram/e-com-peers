'use client'

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
    const router = useRouter()
    const [value, setValue] = useState('')

    const handleSearch = () => {
        if (value.trim()) {
            router.push(`?search=${encodeURIComponent(value.trim())}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };


    return (
         <div className="hidden sm:flex flex-1 max-w-md mx-6 items-center bg-[#F0F0F0] rounded-full px-4 py-2">
          <Search size={20} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            value={value}
            onChange={(e)=>setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for products..." 
            className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-500"
          />
          {/* <Button onClick={handleSearch}>
            <Search />
          </Button> */}
        </div>
    )


}