'use client';

import { useEffect, useState } from 'react';

// Helper function to calculate time ago
const getTimeAgo = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'الآن';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
};

interface TimeAgoProps {
  date: string;
  className?: string;
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeAgo(getTimeAgo(date));
  }, [date]);

  if (!mounted) {
    // Return a placeholder to prevent hydration mismatch
    return <span className={className}>...</span>;
  }

  return <span className={className}>{timeAgo}</span>;
}

