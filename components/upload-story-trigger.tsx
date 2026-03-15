'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/components/providers/web3-provider';
import { createClient } from '@/lib/supabase/client';

interface UploadStoryTriggerProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    className?: string;
    buttonText?: string;
    icon?: boolean;
}

export function UploadStoryTrigger({
    variant = 'primary',
    className = '',
    buttonText = 'Upload Story',
    icon = true
}: UploadStoryTriggerProps) {
    const router = useRouter();
    const { account } = useWeb3();
    const [session, setSession] = React.useState<any>(null);
    const supabase = React.useMemo(() => createClient(), []);

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleUploadClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Strict check: An authenticated Supabase session is required to upload
        if (!session) {
            router.push('/sign-in');
        } else {
            router.push('/upload');
        }
    };

    // Return specific styled buttons based on variant
    const getButtonPreset = () => {
        switch (variant) {
            case 'primary':
                return `comic-button rounded-none ${className}`;
            case 'secondary':
                return `comic-button-secondary bg-[#cc3333] text-white rounded-none ${className}`;
            case 'outline':
                return `border-[2px] border-black bg-white rounded-none font-black uppercase text-[11px] tracking-widest hover:-translate-y-0.5 shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all text-black ${className}`;
            case 'ghost':
            case 'link':
                return `hover:underline font-bold text-foreground cursor-pointer rounded-none ${className}`;
            default:
                return `comic-button rounded-none ${className}`;
        }
    };

    return (
        <Button
            variant={variant === 'primary' || variant === 'secondary' ? 'default' : variant}
            className={getButtonPreset()}
            onClick={handleUploadClick}
        >
            {icon && <Upload className="w-3.5 h-3.5 mr-1.5" />}
            {buttonText}
        </Button>
    );
}
