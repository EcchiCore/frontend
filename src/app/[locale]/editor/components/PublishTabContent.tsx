import React from 'react';
import { ArticleData } from '@/types/article';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PublishTabContentProps {
  articleData: ArticleData;
  publishRequestNote: string;
  setPublishRequestNote: React.Dispatch<React.SetStateAction<string>>;
  requestPublish: () => void;
  publishRequesting: boolean;
}

const PublishTabContent: React.FC<PublishTabContentProps> = ({
                                                               articleData,
                                                               publishRequestNote,
                                                               setPublishRequestNote,
                                                               requestPublish,
                                                               publishRequesting
                                                             }) => {
  return (
    <div className="space-y-6">
      <div className="card bg-base-100 p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-base-content">Publication Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base-content/70">Current Status:</span>
            <Badge className={`badge ${articleData.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
              {articleData.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base-content/70">Article ID:</span>
            <span className="text-base-content/70 font-mono">{articleData.id || 'Not saved yet'}</span>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-base-content">Publish Request</h3>
        <div className="space-y-3">
          <Label className="text-base-content font-semibold">Request Note (Optional)</Label>
          <Textarea
            value={publishRequestNote}
            onChange={(e) => setPublishRequestNote(e.target.value)}  // 修正为使用props中的setter
            placeholder="Add any notes for the publication request..."
            rows={4}
            className="textarea textarea-bordered w-full bg-base-200 text-base-content focus:textarea-primary"
          />
          <Button
            onClick={requestPublish}
            disabled={publishRequesting || !articleData.id}
            className="btn btn-success w-full text-lg font-semibold"
          >
            {publishRequesting ? 'Submitting Request...' : 'Request Publication'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublishTabContent;