import { Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import Image from "next/image";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  categorySlug: string;
  date: string;
  readTime: string;
}

export default function NewsCard(article: Article) {
  // Use fallback image if article.image is empty or invalid
  const imageSrc = article.image && article.image.trim() !== '' 
    ? article.image 
    : '/placeholder-image.jpg'; // Fallback to placeholder

  return (
    <Link href={`/${article.categorySlug}/${article.id}`} className="group block h-full">
      <div className="bg-white dark:bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all h-full flex flex-col">
        <div className="relative w-full h-48 lg:h-58 overflow-hidden bg-gray-200 dark:bg-gray-800">
          {imageSrc !== '/placeholder-image.jpg' ? (
            <Image
              src={imageSrc}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              quality={75}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4 text-right flex flex-col grow">
          <Badge variant="secondary" className="mb-2 self-start">
            {article.category}
          </Badge>
          <h3 className="mb-2 leading-snug group-hover:text-[#c90000] transition-colors line-clamp-2 font-semibold">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 grow">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{article.readTime}</span>
            </div>
            <span>{article.date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
