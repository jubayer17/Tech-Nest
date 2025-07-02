import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faLinkedinIn,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <div className="flex md:flex-row flex-col-reverse items-center justify-between w-full px-10 py-6 bg-white">
      <div className="flex items-center gap-4">
        <Image className="hidden md:block" src={assets.logo} alt="logo" />
        <div className="hidden md:block h-7 w-px bg-gray-400" />
        <p className="py-4 text-center text-xs md:text-sm text-gray-500">
          Copyright 2025 © Jubayer | All Rights Reserved.
        </p>
      </div>
      <div className="flex items-center gap-4">
        {[
          {
            icon: faFacebookF,
            label: "Facebook",
            href: "https://www.facebook.com/jub0.ahmed/",
          },
          {
            icon: faLinkedinIn,
            label: "LinkedIn",
            href: "https://www.linkedin.com/in/jubayer-ahmed26/",
          },
          {
            icon: faGithub,
            label: "GitHub",
            href: "https://github.com/jubayer17",
          },
        ].map(({ icon, label, href }, index) => (
          <a
            key={index}
            href={href}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-400 text-black transition-transform duration-300 ease-in-out hover:scale-125 hover:bg-black hover:text-white cursor-pointer"
          >
            <FontAwesomeIcon icon={icon} className="text-lg" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default Footer;
