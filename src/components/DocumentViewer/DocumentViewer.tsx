import React, { useState, useEffect } from "react";
import { FileText, Download, ExternalLink } from "lucide-react";

interface DocumentViewerProps {
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
}

export default function DocumentViewer({ fileUrl, fileName, mimeType }: DocumentViewerProps) {
  const [type, setType] = useState<string | null>(null);

  // Scroll to top when document loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fileUrl]);

  // Detect file type from URL, mimeType, or fileName
  useEffect(() => {
    if (!fileUrl) {
      setType(null);
      return;
    }

    // Check mimeType first
    if (mimeType) {
      if (mimeType.includes("pdf")) {
        setType("pdf");
        return;
      } else if (mimeType.includes("word") || mimeType.includes("document") || mimeType.includes("msword") || mimeType.includes("officedocument")) {
        setType("word");
        return;
      } else if (mimeType.includes("video")) {
        setType("video");
        return;
      } else if (mimeType.includes("image")) {
        setType("image");
        return;
      }
    }

    // Check file extension from URL or fileName
    const url = fileUrl.toLowerCase();
    const name = fileName?.toLowerCase() || "";

    if (url.endsWith(".pdf") || name.endsWith(".pdf")) {
      setType("pdf");
    } else if (url.endsWith(".doc") || url.endsWith(".docx") || name.endsWith(".doc") || name.endsWith(".docx")) {
      setType("word");
    } else if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg") || name.endsWith(".mp4") || name.endsWith(".webm") || name.endsWith(".ogg")) {
      setType("video");
    } else if (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".gif") || url.endsWith(".webp") || 
               name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".gif") || name.endsWith(".webp")) {
      setType("image");
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      setType("youtube");
    } else {
      setType("unknown");
    }
  }, [fileUrl, fileName, mimeType]);

  // Extract YouTube video ID
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // For blob URLs, we need to handle them differently
  const isBlobUrl = fileUrl.startsWith("blob:");

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* PDF VIEWER */}
      {type === "pdf" && (
        <>
          {isBlobUrl ? (
            <embed
              src={fileUrl}
              type="application/pdf"
              className="w-full h-full rounded-lg shadow"
              style={{ minHeight: '400px' }}
              onLoad={() => {
                // Scroll to top when embed loads
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0 rounded-lg shadow"
              title="PDF Viewer"
              style={{ minHeight: '400px' }}
              onLoad={() => {
                // Scroll to top when iframe loads
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Also try to scroll the iframe content to top
                try {
                  const iframe = document.querySelector('iframe[title="PDF Viewer"]') as HTMLIFrameElement;
                  if (iframe?.contentWindow) {
                    iframe.contentWindow.scrollTo(0, 0);
                  }
                } catch (e) {
                  // CORS may prevent accessing iframe content
                }
              }}
            />
          )}
        </>
      )}

      {/* WORD VIEWER VIA GOOGLE DOCS */}
      {type === "word" && (
        <>
          {isBlobUrl ? (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 rounded-lg border border-gray-200">
              <FileText className="w-16 h-16 text-blue-500 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{fileName || "Word Document"}</h4>
              <p className="text-gray-600 mb-4 text-center">Word document preview not available in browser</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={fileName}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
              >
                <Download className="h-5 w-5" />
                <span>Download & Open Document</span>
              </a>
            </div>
          ) : (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              className="w-full h-full border-0 rounded-lg shadow"
              title="Word Viewer"
              style={{ minHeight: '400px' }}
            />
          )}
        </>
      )}

      {/* VIDEO VIEWER */}
      {type === "video" && (
        <div className="w-full h-full">
          {isBlobUrl ? (
            <video
              src={fileUrl}
              controls
              className="w-full h-full rounded-lg shadow"
              style={{ minHeight: '400px' }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <video
              src={fileUrl}
              controls
              className="w-full h-full rounded-lg shadow"
              style={{ minHeight: '400px' }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}

      {/* IMAGE VIEWER */}
      {type === "image" && (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={fileUrl}
            alt={fileName || "Image"}
            className="max-w-full max-h-full rounded-lg shadow object-contain"
            style={{ minHeight: '400px' }}
          />
        </div>
      )}

      {/* YOUTUBE VIEWER */}
      {type === "youtube" && (
        <div className="w-full h-full">
          {(() => {
            const videoId = getYouTubeId(fileUrl);
            if (videoId) {
              return (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="w-full h-full border-0 rounded-lg shadow"
                  title="YouTube Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ minHeight: '400px' }}
                />
              );
            } else {
              return (
                <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="w-16 h-16 text-red-500 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Invalid YouTube URL</h4>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Open YouTube Link</span>
                  </a>
                </div>
              );
            }
          })()}
        </div>
      )}

      {/* UNKNOWN TYPE */}
      {type === "unknown" && (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{fileName || "Document"}</h4>
          <p className="text-gray-600 mb-4 text-center">Format non supporté pour la prévisualisation</p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={fileName}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
          >
            <Download className="h-5 w-5" />
            <span>Download Document</span>
          </a>
        </div>
      )}

      {/* NO TYPE DETECTED */}
      {!type && (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-600">Chargement du document...</p>
        </div>
      )}
    </div>
  );
}

