import { CurrencyComboBox } from '@/components/CurrencyComboBox';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from "next/navigation";
import Link from 'next/link';
import React from 'react'

async function page() {
    const user = await currentUser();
    if(!user)  {
        redirect("/sign-in");
    }
  return (
    <div
    className="container flex min-h-screen max-w-2xl flex-col
             items-center justify-center gap-4 px-8"
            >

        <div>
        <h1 className='text-center text-3x1'>
            Dobrodosao, <span className='ml-2 font-bold'>
                {user?.firstName} 👋</span>
        </h1>
        <h2 className='mt-4 text-center text-base
        text-muted-foreground'>
            Podesi valutu koja ti odgovara 
        </h2>
        <h3 className='mt-2 text-center text-sm
        text-muted-foreground'>
            Ova podešavanja možeš da promeniš kad god želiš
        </h3>
        </div>
        <Separator />
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>Valuta</CardTitle>
                <CardDescription>
                    Podesi stalnu valutu za sve transakcije
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CurrencyComboBox />
            </CardContent>
        </Card>
        <Separator />
        <Button className='w-full' asChild>
            <Link href={"/"}>Gotovo, vrati me na pocetnu</Link>
        </Button>
        <div className='mt-8'>
            <Logo></Logo>
        </div>
    </div>
  )
}

export default page