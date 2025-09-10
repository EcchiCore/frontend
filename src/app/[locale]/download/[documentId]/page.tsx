"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import DownloadSidebar from "./wedgies";
import { encodeForUrl } from "../../lib/urlEncryption";
import AdScriptLoader from "./AdScript";

// Interfaces
interface ManagementLink {
  id: number;
  name: string;
  url: string;
  ready: boolean;
}

interface OperatingSystem {
  id: number;
  Name: string;
  management: ManagementLink[];
}

interface Article {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  slug: string;
  highlight: boolean | null;
  Version: string;
  OS: OperatingSystem[];
}

interface ApiResponse {
  data: Article[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface LoadingStage {
  id: number;
  title: string;
  description: string;
  status: "pending" | "loading" | "complete" | "error";
  errorMessage?: string;
}

interface ErrorInfo {
  message: string;
  details?: string;
  errorCode?: string;
}

// Components
const StageIndicator = ({ stage }: { stage: LoadingStage }) => {
  const getStatusClass = () => {
    switch (stage.status) {
      case "complete":
        return "bg-green-500";
      case "loading":
        return "bg-blue-500 animate-pulse";
      default:
        return "bg-gray-200";
    }
  };

  const getTextClass = () => {
    switch (stage.status) {
      case "loading":
        return "text-blue-600";
      case "complete":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  const renderIcon = () => {
    switch (stage.status) {
      case "loading":
        return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />;
      case "complete":
        return <CheckCircle2 className="w-12 h-12 text-green-500" />;
      case "error":
        return <XCircle className="w-12 h-12 text-red-500" />;
      default:
        return <div className="w-12 h-12 rounded-full border-2 border-gray-200" />;
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-6 top-10 w-0.5 h-12 bg-gray-200">
        <div className={`w-full ${getStatusClass()} h-full transition-all duration-500`} />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">{renderIcon()}</div>
        <div className="flex-1">
          <h3 className={`font-semibold ${getTextClass()}`}>{stage.title}</h3>
          <p className="text-sm text-gray-500">{stage.description}</p>
          {stage.status === "error" && stage.errorMessage && (
            <p className="text-sm text-red-500 mt-1">{stage.errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = ({ currentStage }: { currentStage: number }) => {
  const [stages, setStages] = useState<LoadingStage[]>([
    {
      id: 1,
      title: "Initializing Request",
      description: "Setting up secure connection",
      status: "pending",
    },
    {
      id: 2,
      title: "Fetching Token",
      description: "Authenticating your request",
      status: "pending",
    },
    {
      id: 3,
      title: "Loading Data",
      description: "Retrieving downloads information",
      status: "pending",
    },
  ]);

  const getStageStatus = (stageId: number, currentStage: number) => {
    if (stageId < currentStage) return "complete";
    if (stageId === currentStage) return "loading";
    return "pending";
  };

  useEffect(() => {
    setStages((prev) =>
      prev.map((stage) => ({
        ...stage,
        status: getStageStatus(stage.id, currentStage),
      }))
    );
  }, [currentStage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex justify-center items-center px-4">
      <AdScriptLoader />
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Loading Content</h2>
        <div className="space-y-6">
          {stages.map((stage) => (
            <StageIndicator key={stage.id} stage={stage} />
          ))}
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay = ({
  message,
  details,
  errorCode,
  onRetry,
}: {
  message: string;
  details?: string;
  errorCode?: string;
  onRetry?: () => void;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col justify-center items-center px-4">
    <AdScriptLoader />
    <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md w-full">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <div className="absolute inset-0 animate-ping">
            <AlertCircle className="w-16 h-16 text-red-500 opacity-20" />
          </div>
        </div>
      </div>
      <p className="text-2xl text-red-600 font-bold mb-4">{message}</p>
      {errorCode && <p className="text-sm text-gray-500 mb-3">Error Code: {errorCode}</p>}
      {details && <p className="text-gray-600 mb-6 text-sm">{details}</p>}
      <button
        onClick={onRetry}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 w-full"
      >
        <RefreshCw className="w-5 h-5" />
        Try Again
      </button>
    </div>
  </div>
);

const DownloadLinks = ({ os }: { os: OperatingSystem[] }) => (
  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
    <h2 className="text-xl font-bold text-gray-800 mb-4">Download Links:</h2>
    {os?.length > 0 ? (
      <ul className="space-y-3">
        {os.map((osItem) => (
          <li key={osItem.id} className="space-y-2">
            <div className="font-medium text-gray-700">{osItem.Name}</div>
            <div className="pl-4 space-y-2">
              {osItem.management?.map((link) => (
                <div key={link.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                  <a
                    href={link.ready ? link.url : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-base font-medium transition-colors duration-300 ${
                      link.ready ? "text-green-600 hover:text-green-800 hover:underline" : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {link.name}
                  </a>
                  <span className="ml-2">{link.ready ? "✅" : "⏳"}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-center py-4">No download links available yet</p>
    )}
  </div>
);

const DownloadPage = () => {
  const params = useParams();
  const rawDocumentId = params?.documentId as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(1);
  const [error, setError] = useState<ErrorInfo | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setCurrentStage(1);
      try {
        const encodedDocumentId = encodeForUrl(rawDocumentId);
        setCurrentStage(2);
        const tokenResponse = await fetch(`/api/download?documentId=${encodedDocumentId}`);
        const tokenData = await tokenResponse.json();
        if (!tokenData.token) throw new Error("Failed to get access token");

        setCurrentStage(3);
        const articleResponse = await fetch(`/api/download?token=${tokenData.token}`);
        if (!articleResponse.ok) throw new Error(`HTTP error! status: ${articleResponse.status}`);

        const result: ApiResponse = await articleResponse.json();
        if (result.data?.[0]) {
          setArticle(result.data[0]);
        } else {
          throw new Error("Article Not Found");
        }
      } catch (err) {
        setError({
          message: "Error Loading Content",
          details: err instanceof Error ? err.message : "An unexpected error occurred",
          errorCode: "ERR_FETCH_FAILED",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!rawDocumentId) {
      setError({
        message: "Missing Document ID",
        details: "No document ID was provided in the URL.",
        errorCode: "MISSING_ID",
      });
      setLoading(false);
      return;
    }

    fetchArticle();
  }, [rawDocumentId]);

  if (loading) return <LoadingScreen currentStage={currentStage} />;
  if (error) return <ErrorDisplay {...error} onRetry={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <AdScriptLoader />
      <div className="flex justify-center items-center py-12">
        <div className="bg-white p-6 shadow-xl rounded-2xl w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article?.title}</h1>
          <p className="text-gray-600 mb-6">{article?.description}</p>
          <DownloadLinks os={article?.OS || []} />
        </div>
      </div>
	  <DownloadSidebar />
    </div>
  );
};

export default DownloadPage;
