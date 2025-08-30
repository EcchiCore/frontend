"use client";
import React from "react";
import {
  Heart,
  Share2,
  UserPlus,
  Check,
} from "lucide-react";
import { Button } from '@/components/ui/button';

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
        <Button
          variant={isFollowing ? "outline" : "default"}
          onClick={handleFollow}
          className="flex items-center gap-2"
        >
          {isFollowing ? (
            <>
              <Check className="w-4 h-4" />
              <span>กำลังติดตาม</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>ติดตาม</span>
            </>
          )}
        </Button>
      )}

      <div className="flex items-center gap-4">
        <Button
          variant={isFavorited ? "destructive" : "outline"}
          onClick={handleFavorite}
          className="flex items-center gap-2"
        >
          <Heart className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} />
          <span>{favoritesCount > 0 ? favoritesCount : 'ถูกใจ'}</span>
        </Button>

        <Button onClick={handleShare} variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  </div>
);

export default InteractionBar;