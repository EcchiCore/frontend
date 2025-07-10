"use client";
import React from "react";
import {
  HeartIcon as HeartOutline,
  ShareIcon,
  UserPlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface InteractionBarProps {
  isCurrentUserAuthor: boolean;
  isFollowing: boolean;
  handleFollow: () => void;
  isFavorited: boolean;
  favoritesCount: number;
  handleFavorite: () => void;
  handleShare: () => void;
  isDarkBackground: boolean;
}

const InteractionBar: React.FC<InteractionBarProps> = ({
                                                         isCurrentUserAuthor,
                                                         isFollowing,
                                                         handleFollow,
                                                         isFavorited,
                                                         favoritesCount,
                                                         handleFavorite,
                                                         handleShare,
                                                         isDarkBackground,
                                                       }) => (
  <div className={`mt-6 pt-6 ${isDarkBackground ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      {!isCurrentUserAuthor && (
        <button
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-200 ${
            isFollowing
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={handleFollow}
        >
          {isFollowing ? (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>กำลังติดตาม</span>
            </>
          ) : (
            <>
              <UserPlusIcon className="w-4 h-4" />
              <span>ติดตาม</span>
            </>
          )}
        </button>
      )}

      <div className="flex items-center gap-4">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
            isFavorited
              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={handleFavorite}
        >
          {isFavorited ? (
            <HeartSolid className="w-4 h-4" />
          ) : (
            <HeartOutline className="w-4 h-4" />
          )}
          <span>{favoritesCount > 0 ? favoritesCount : 'ถูกใจ'}</span>
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          onClick={handleShare}
        >
          <ShareIcon className="w-4 h-4" />
          <span>แชร์</span>
        </button>
      </div>
    </div>
  </div>
);

export default InteractionBar;