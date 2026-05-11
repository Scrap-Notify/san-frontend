import { useState } from 'react';
import { User, Mail, Shield, Bell, Lock, ChevronRight, Camera, Settings, LogOut } from 'lucide-react';
import { authTokenStorage } from '../api/client';
import { useNavigate } from 'react-router-dom';
import githubSvg from '@dashboard/assets/github.svg';

export function ProfilePage() {
  const navigate = useNavigate();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    await authTokenStorage.clearToken();
    navigate('/login');
  };

  return (
    <section className="mx-auto w-full max-w-[1200px] space-y-12 py-12 text-white">
      {/* Header Section */}
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">마이 프로필</h1>
        <p className="text-lg text-white/50">개인 정보와 계정 설정을 관리하세요.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[40px] bg-[#131718] p-10 border border-white/5 shadow-2xl flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <div className="h-32 w-32 rounded-full border-2 border-[#4ade80]/20 p-1 group-hover:border-[#4ade80]/50 transition-all duration-300">
                <div className="h-full w-full rounded-full bg-gradient-to-tr from-[#1a1f21] to-[#0B0D0F] flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
                  <User size={50} className="text-[#4ade80]" strokeWidth={1.5} />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-[#4ade80] flex items-center justify-center text-black shadow-[0_0_15px_rgba(74,222,128,0.4)] border-4 border-[#131718]">
                <Camera size={16} />
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-2xl font-bold tracking-tight">사용자</h2>
              <p className="text-sm text-white/40 mt-1 font-medium">user@example.com</p>
            </div>

            <div className="mt-10 w-full grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">지식 카드</p>
                <p className="text-xl font-bold text-[#4ade80] mt-1">0</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">TIL 작성</p>
                <p className="text-xl font-bold text-[#4ade80] mt-1">0</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-white/5 py-4 text-sm font-bold text-white/40 hover:bg-red-500/10 hover:text-red-400 border border-white/5 transition-all active:scale-95"
            >
              <LogOut size={18} />
              로그아웃
            </button>
          </div>

          <div className="rounded-[32px] bg-[#131718] p-8 border border-white/5 flex flex-col gap-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/30">연동된 서비스</h3>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#4ade80]/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                  <img src={githubSvg} alt="GitHub" className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ filter: 'invert(1)' }} />
                </div>
                <span className="text-sm font-bold">GitHub</span>
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">미연동</span>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-10">
          <div className="rounded-[40px] bg-[#131718] p-10 border border-white/5 shadow-2xl">
            <h3 className="text-xl font-bold mb-10 flex items-center gap-3">
               <Settings className="text-[#4ade80]" size={20} />
               계정 설정
            </h3>
            
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/30 ml-1">이름</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="이름을 입력하세요"
                      className="w-full rounded-2xl bg-white/[0.03] border border-white/5 py-4 pl-12 pr-6 text-sm font-medium outline-none focus:border-[#4ade80]/30 focus:bg-white/[0.06] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/30 ml-1">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="email" 
                      placeholder="이메일을 입력하세요"
                      className="w-full rounded-2xl bg-white/[0.03] border border-white/5 py-4 pl-12 pr-6 text-sm font-medium outline-none focus:border-[#4ade80]/30 focus:bg-white/[0.06] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <h4 className="text-sm font-black uppercase tracking-widest text-white/20 mb-6">보안 및 개인정보</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#4ade80] transition-colors">
                        <Lock size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">비밀번호 변경</span>
                        <span className="text-xs text-white/30">마지막 변경: 3개월 전</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-colors" />
                  </div>

                  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#4ade80] transition-colors">
                        <Shield size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">2단계 인증 (2FA)</span>
                        <span className="text-xs text-white/30">계정을 더 안전하게 보호하세요</span>
                      </div>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-white/5 p-1 transition-all cursor-pointer">
                       <div className="h-4 w-4 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <h4 className="text-sm font-black uppercase tracking-widest text-white/20 mb-6">알림 설정</h4>
                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                   <div className="flex items-center gap-5">
                      <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                        <Bell size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">푸시 알림</span>
                        <span className="text-xs text-white/30">주요 업데이트 및 활동 알림을 받습니다</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                      className={`h-7 w-12 rounded-full p-1 transition-all duration-300 ${isNotificationsEnabled ? 'bg-[#4ade80]' : 'bg-white/10'}`}
                    >
                       <div className={`h-5 w-5 rounded-full bg-black shadow-md transition-all duration-300 ${isNotificationsEnabled ? 'ml-5' : 'ml-0'}`} />
                    </button>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-end gap-4">
              <button className="px-8 py-4 rounded-2xl text-sm font-bold text-white/40 hover:text-white transition-all">취소</button>
              <button className="px-10 py-4 rounded-2xl bg-[#4ade80] text-black text-sm font-black shadow-[0_10px_30px_rgba(74,222,128,0.2)] hover:shadow-[0_15px_35px_rgba(74,222,128,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">설정 저장</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
