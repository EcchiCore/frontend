'use client';

import React from 'react';
import Image from 'next/image';
import { User, Mail, FileText, ImageIcon } from 'lucide-react';

interface UserData {
  username: string;
  email: string;
  bio: string;
  image: string;
}

interface ProfileSettingsProps {
  formData: UserData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
                                                           formData,
                                                           handleChange,
                                                           showPreview,
                                                           setShowPreview
                                                         }) => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-base-100 rounded-xl shadow-lg space-y-6">
      {/* Form Section */}
      <div className="space-y-4">
        <div className="form-control">
          <label className="label flex items-center gap-2">
            <User className="text-primary" size={20} />
            <span className="label-text text-base font-medium">ชื่อผู้ใช้</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="ชื่อที่ต้องการให้ผู้อื่นเห็น"
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="form-control">
          <label className="label flex items-center gap-2">
            <Mail className="text-primary" size={20} />
            <span className="label-text text-base font-medium">อีเมล</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="form-control">
          <label className="label flex items-center gap-2">
            <FileText className="text-primary" size={20} />
            <span className="label-text text-base font-medium">ประวัติโดยย่อ</span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="เล่าเกี่ยวกับตัวคุณ..."
            className="textarea textarea-bordered w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="form-control">
          <label className="label flex items-center gap-2">
            <ImageIcon className="text-primary" size={20} />
            <span className="label-text text-base font-medium">URL รูปภาพโปรไฟล์</span>
          </label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/your-image.jpg"
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="btn btn-primary px-8"
            onClick={() => setShowPreview(true)}
          >
            ดูตัวอย่างโปรไฟล์
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-base-100 rounded-xl shadow-xl">
            <button
              className="btn btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowPreview(false)}
            >
              ✕
            </button>

            <div className="p-6 text-center">
              <div className="avatar mb-4">
                <div className="w-32 rounded-full ring-2 ring-primary ring-offset-4 mx-auto">
                  <Image
                    src={formData.image || '/default-avatar.png'}
                    alt={formData.username}
                    width={128}
                    height={128}
                    className="rounded-full object-cover"
                    onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-primary">
                {formData.username || 'ชื่อผู้ใช้'}
              </h2>
              <p className="text-base-content/70 mb-4">
                {formData.email || 'อีเมล'}
              </p>
              <p className="text-base-content whitespace-pre-wrap break-words px-4">
                {formData.bio || 'ยังไม่มีประวัติโดยย่อ'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;