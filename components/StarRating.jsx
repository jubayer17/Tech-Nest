"use client";
import React from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        if (rating >= i) {
          return (
            <Image
              key={i}
              src={assets.star_icon}
              alt="star"
              className="w-4 h-4"
            />
          );
        } else if (rating >= i - 0.5) {
          return (
            <div key={i} className="relative w-4 h-4">
              <Image
                src={assets.star_dull_icon}
                alt="half"
                className="absolute top-0 left-0 w-4 h-4"
              />
              <div className="absolute top-0 left-0 w-[8px] h-4 overflow-hidden">
                <Image
                  src={assets.star_icon}
                  alt="half star"
                  className="w-4 h-4"
                />
              </div>
            </div>
          );
        } else {
          return (
            <Image
              key={i}
              src={assets.star_dull_icon}
              alt="empty"
              className="w-4 h-4"
            />
          );
        }
      })}
    </div>
  );
};

export default StarRating;
