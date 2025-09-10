// /[locale]/application/downloads/page.tsx
"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

// กำหนด type พื้นฐานสำหรับความต้องการของระบบ
interface SystemRequirements {
  os?: string[];
  processor: string;
  ram: string;
  storage: string;
  graphics?: string;
}

// กำหนด type ข้อมูลลิงค์ดาวน์โหลด
interface DownloadLinks {
  windows?: string;
  macos?: string;
  linux?: string;
}

// กำหนด type ข้อมูลพื้นฐานของเวอร์ชัน
interface VersionInfo {
  version: string;
  date: string;
  size: string;
  notes: string;
  status: string;
  systemRequirements?: Partial<SystemRequirements>;
  downloads: DownloadLinks;
}

// กำหนด type ของเวอร์ชันทดลอง
interface ExperimentalVersionInfo extends VersionInfo {
  warning: string;
}

// กำหนด type ของคอนฟิกทั้งหมด
interface DownloadConfig {
  pageTitle: string;
  helpText: string;
  helpLink: string;
  defaultSystemRequirements: SystemRequirements;
  additionalRequirements: string[];
  latestVersion: string;
  experimental?: ExperimentalVersionInfo;
  versions: VersionInfo[];
}

export default function DownloadPage(): React.ReactElement {
  const [config, setConfig] = useState<DownloadConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/download-config.json');
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('ไม่สามารถโหลดข้อมูลคอนฟิกได้:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading || !config) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // หาข้อมูลเวอร์ชันล่าสุด
  const latestVersionInfo = config.versions.find(v => v.version === config.latestVersion) || config.versions[0];

  // ผสานข้อมูล system requirements ของเวอร์ชันล่าสุดกับค่าเริ่มต้น
  const latestVersionRequirements = {
    ...config.defaultSystemRequirements,
    ...(latestVersionInfo.systemRequirements || {})
  };

  // ผสานข้อมูล system requirements ของเวอร์ชันทดลองกับค่าเริ่มต้น (ถ้ามี)
  const experimentalVersionRequirements = config.experimental
    ? {
      ...config.defaultSystemRequirements,
      ...(config.experimental.systemRequirements || {})
    }
    : null;

  // ฟังก์ชันสำหรับกำหนดสีของ badge ตามสถานะ
  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'ทดลอง':
        return 'badge-warning';
      case 'ก่อนเปิดตัว':
        return 'badge-info';
      case 'รับการรับรอง':
        return 'badge-success';
      default:
        return 'badge-ghost';
    }
  };

  // เช็คว่ามีลิงค์ดาวน์โหลดสำหรับระบบปฏิบัติการนั้นๆ หรือไม่
  const hasDownloadLink = (downloads: DownloadLinks, os: string): boolean => {
    return !!(downloads && downloads[os as keyof DownloadLinks]);
  };

  // ฟังก์ชันสำหรับแสดงไอคอนของระบบปฏิบัติการ
  const getOSIcon = (os: string): React.ReactElement => {
    switch (os) {
      case 'windows':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 3.449L9.75 2.1v9.45H0m10.949-9.6L24 0v11.4H10.949M0 12.6h9.75v9.45L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
          </svg>
        );
      case 'macos':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 16h-2v-2h2v2zm1-10c-1.657 0-3 1.343-3 3h2c0-.551.449-1 1-1s1 .449 1 1c0 .342-.175.631-.437.822l-.563.329C11.448 12.895 11 13.895 11 15h2c0-.551.448-1 1-1 .553 0 1-.449 1-1 0-1.104-.896-2-2-2z"/>
          </svg>
        );
      case 'linux':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.503 20.909c-1.366 0-2.604-.998-3.01-2.414l-.491-1.639C9.002 16.856 8 17 7 17c-1.634 0-3-1.346-3-3 0-1.191.711-2.215 1.714-2.707l.246-.123C5.748 9.815 5 8.324 5 6.693 5 3.529 7.529 1 10.693 1c2.851 0 5.198 2.152 5.443 5.025.207-.025.407-.025.607-.025C18.522 6 20 7.478 20 9.246c0 .752-.293 1.429-.732 1.962.42.31.732.786.732 1.316 0 .838-.629 1.522-1.409 1.62.055.238.101.48.101.732 0 1.657-1.343 3-3 3-.824 0-1.519-.386-2.025-.931-.506.545-1.196.931-2.005.931v.033h-.159z"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        );
    }
  };

  // ฟังก์ชันสร้างปุ่มดาวน์โหลด
  const renderDownloadButton = (downloads: DownloadLinks, os: string, variant: string = 'btn-primary', size: string = ''): React.ReactElement => {
    const downloadUrl = downloads[os as keyof DownloadLinks];
    const osNames: Record<string, string> = {
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux'
    };
    const osName = osNames[os] || os;

    const btnClass = `btn ${variant} ${size}`;

    if (!downloadUrl) {
      return (
        <button className={`${btnClass} opacity-50 cursor-not-allowed`} disabled>
          {getOSIcon(os)}
          {osName} (ไม่มี)
        </button>
      );
    }

    return (
      <a href={downloadUrl} className={btnClass} target="_blank" rel="noopener noreferrer">
        {getOSIcon(os)}
        {osName}
      </a>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{config.pageTitle}</h1>

      {/* ส่วนเวอร์ชันล่าสุด / เวอร์ชันทดลอง */}
      <div className="bg-base-200 p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">รุ่นล่าสุด</h2>
          <div className={`badge ${getStatusBadgeColor(latestVersionInfo.status)} badge-lg`}>
            {latestVersionInfo.status}
          </div>
        </div>

        <div className="stats shadow w-full">
          <div className="stat">
            <div className="stat-title">เวอร์ชัน</div>
            <div className="stat-value">{latestVersionInfo.version}</div>
          </div>

          <div className="stat">
            <div className="stat-title">วันที่ปล่อย</div>
            <div className="stat-value text-lg">{latestVersionInfo.date}</div>
          </div>

          <div className="stat">
            <div className="stat-title">ขนาด</div>
            <div className="stat-value text-lg">{latestVersionInfo.size}</div>
          </div>
        </div>

        {config.experimental && config.experimental.warning && (
          <div className="p-4 border border-warning rounded-md my-4">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{config.experimental.warning}</p>
            </div>
          </div>
        )}

        {/* ปุ่มดาวน์โหลดแยกตามระบบปฏิบัติการ */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">ดาวน์โหลด</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderDownloadButton(latestVersionInfo.downloads, 'windows')}
            {renderDownloadButton(latestVersionInfo.downloads, 'macos')}
            {renderDownloadButton(latestVersionInfo.downloads, 'linux')}
          </div>
        </div>

        {/* ส่วนความต้องการของระบบ */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">ระบบที่รองรับ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border p-4 rounded-md">
              <h4 className="font-medium mb-2">ระบบปฏิบัติการ</h4>
              <ul className="list-disc list-inside">
                {latestVersionRequirements.os?.map((os, index) => (
                  <li key={index}>{os}</li>
                ))}
              </ul>
            </div>
            <div className="border p-4 rounded-md">
              <h4 className="font-medium mb-2">ฮาร์ดแวร์</h4>
              <ul className="list-disc list-inside">
                <li>CPU: {latestVersionRequirements.processor}</li>
                <li>RAM: {latestVersionRequirements.ram}</li>
                <li>พื้นที่: {latestVersionRequirements.storage}</li>
                {latestVersionRequirements.graphics && (
                  <li>กราฟิก: {latestVersionRequirements.graphics}</li>
                )}
              </ul>
            </div>
            <div className="border p-4 rounded-md">
              <h4 className="font-medium mb-2">อื่น ๆ</h4>
              <ul className="list-disc list-inside">
                {config.additionalRequirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ส่วนเวอร์ชันทดลอง (ถ้ามี) */}
        {config.experimental && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">รุ่นทดลอง</h2>
              <div className={`badge ${getStatusBadgeColor(config.experimental.status)} badge-lg`}>
                {config.experimental.status}
              </div>
            </div>

            <div className="stats shadow w-full">
              <div className="stat">
                <div className="stat-title">เวอร์ชัน</div>
                <div className="stat-value">{config.experimental.version}</div>
              </div>
              <div className="stat">
                <div className="stat-title">วันที่ปล่อย</div>
                <div className="stat-value text-lg">{config.experimental.date}</div>
              </div>
              <div className="stat">
                <div className="stat-title">ขนาด</div>
                <div className="stat-value text-lg">{config.experimental.size}</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">ดาวน์โหลด (รุ่นทดลอง)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderDownloadButton(config.experimental.downloads, 'windows', 'btn-warning')}
                {renderDownloadButton(config.experimental.downloads, 'macos', 'btn-warning')}
                {renderDownloadButton(config.experimental.downloads, 'linux', 'btn-warning')}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">ระบบที่รองรับ (รุ่นทดลอง)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">ระบบปฏิบัติการ</h4>
                  <ul className="list-disc list-inside">
                    {experimentalVersionRequirements?.os?.map((os, index) => (
                      <li key={index}>{os}</li>
                    ))}
                  </ul>
                </div>
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">ฮาร์ดแวร์</h4>
                  <ul className="list-disc list-inside">
                    <li>CPU: {experimentalVersionRequirements?.processor}</li>
                    <li>RAM: {experimentalVersionRequirements?.ram}</li>
                    <li>พื้นที่: {experimentalVersionRequirements?.storage}</li>
                    {experimentalVersionRequirements?.graphics && (
                      <li>กราฟิก: {experimentalVersionRequirements.graphics}</li>
                    )}
                  </ul>
                </div>
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">อื่น ๆ</h4>
                  <ul className="list-disc list-inside">
                    {config.additionalRequirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="divider">รุ่นก่อนหน้า</div>

      {/* ตารางเวอร์ชันก่อนหน้า */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
          <tr>
            <th>เวอร์ชัน</th>
            <th>วันที่</th>
            <th>ขนาด</th>
            <th>สถานะ</th>
            <th>โน้ หมายเหตุ</th>
            <th>ดาวน์โหลด</th>
          </tr>
          </thead>
          <tbody>
          {config.versions
            .filter(version => version.version !== '-') // กรองเวอร์ชันที่ไม่ใช่ dummy
            .map((version, index) => (
              <tr key={index}>
                <td>{version.version}</td>
                <td>{version.date}</td>
                <td>{version.size}</td>
                <td>
                  <div className={`badge ${getStatusBadgeColor(version.status)}`}>
                    {version.status}
                  </div>
                </td>
                <td>{version.notes}</td>
                <td className="flex gap-1">
                  {hasDownloadLink(version.downloads, 'windows') && (
                    <a href={version.downloads.windows} className="btn btn-xs btn-outline" title="Windows">
                      {getOSIcon('windows')}
                    </a>
                  )}
                  {hasDownloadLink(version.downloads, 'macos') && (
                    <a href={version.downloads.macos} className="btn btn-xs btn-outline" title="macOS">
                      {getOSIcon('macos')}
                    </a>
                  )}
                  {hasDownloadLink(version.downloads, 'linux') && (
                    <a href={version.downloads.linux} className="btn btn-xs btn-outline" title="Linux">
                      {getOSIcon('linux')}
                    </a>
                  )}
                  {!hasDownloadLink(version.downloads, 'windows') &&
                    !hasDownloadLink(version.downloads, 'macos') &&
                    !hasDownloadLink(version.downloads, 'linux') && (
                      <span className="text-sm text-gray-500">ไม่มีลิงค์</span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ส่วนข้อความช่วยเหลือ */}
      <div className="alert alert-info mt-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{config.helpText} <Link href={config.helpLink} className="underline">คู่มือการติดตั้ง</Link></span>
      </div>
    </div>
  );
}