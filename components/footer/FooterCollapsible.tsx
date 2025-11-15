'use client';

import { useState, useId, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface FooterLink {
  href: string;
  label: string;
}

interface FooterCollapsibleProps {
  title: string;
  links: FooterLink[];
}

export function FooterCollapsible({ title, links }: FooterCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const id = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="text-right">
      {/* Mobile - Collapsible */}
      {isMounted && (
        <Collapsible 
          open={isOpen} 
          onOpenChange={setIsOpen} 
          className="md:hidden"
        >
          <CollapsibleTrigger 
            className="flex items-center justify-between w-full mb-4"
            aria-controls={`footer-collapsible-${id}`}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
            <h4>{title}</h4>
          </CollapsibleTrigger>
          <CollapsibleContent id={`footer-collapsible-${id}`}>
            <ul className="space-y-2 text-sm pb-4">
              {links.map((link, index) => (
                <li key={`${link.href}-${index}`}>
                  <Link
                    href={`/${link.href}`}
                    className="text-gray-400 hover:text-white block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Mobile - Placeholder before mount */}
      {!isMounted && (
        <div className="md:hidden">
          <div className="flex items-center justify-between w-full mb-4">
            <ChevronDown className="w-5 h-5" />
            <h4>{title}</h4>
          </div>
        </div>
      )}

      {/* Desktop - Always Visible */}
      <div className="hidden md:block">
        <h4 className="mb-4">{title}</h4>
        <ul className="space-y-2 text-sm">
          {links.map((link, index) => (
            <li key={`${link.href}-${index}`}>
              <Link href={`/${link.href}`} className="text-gray-400 hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
