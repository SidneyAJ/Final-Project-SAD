import { useState, useRef } from 'react'
import { Play, Pause, Volume2, Maximize, SkipForward, Clock, Info, Calendar, Phone } from 'lucide-react'

export default function VideoSection() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [activeChapter, setActiveChapter] = useState(0)

    const chapters = [
        { title: "Pengenalan Klinik", duration: "02:30", icon: Info },
        { title: "Layanan Kami", duration: "03:45", icon: Calendar },
        { title: "Jam Operasional", duration: "01:15", icon: Clock },
        { title: "Cara Daftar Online", duration: "04:20", icon: Play },
        { title: "Kontak Penting", duration: "01:50", icon: Phone },
    ]

    return (
        <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Video Profil & Panduan</h2>
                    <p className="text-gray-400">Kenali kami lebih dekat dan pelajari cara mendaftar</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 bg-gray-800/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-700 shadow-2xl">
                    {/* Main Video Player Area */}
                    <div className="lg:col-span-2 relative aspect-video bg-black group">
                        {/* Placeholder Video Content */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/50 animate-pulse">
                                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {chapters[activeChapter].title}
                                </h3>
                                <p className="text-gray-400 text-sm">Klik untuk memutar video</p>
                            </div>
                        </div>

                        {/* Video Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {/* Progress Bar */}
                            <div className="w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer overflow-hidden">
                                <div className="h-full w-1/3 bg-primary-500 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                    </button>
                                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <SkipForward className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <span className="text-white">01:23</span>
                                        <span className="text-gray-400">/</span>
                                        <span className="text-gray-400">{chapters[activeChapter].duration}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <Volume2 className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <Maximize className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Playlist Sidebar */}
                    <div className="p-6 bg-gray-800/80 border-l border-gray-700 overflow-y-auto max-h-[500px]">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                            Daftar Putar
                        </h3>
                        <div className="space-y-2">
                            {chapters.map((chapter, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveChapter(idx)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 text-left group ${activeChapter === idx
                                            ? 'bg-primary-600/20 border border-primary-500/50'
                                            : 'hover:bg-gray-700/50 border border-transparent'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${activeChapter === idx ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-400 group-hover:text-white'
                                        }`}>
                                        <chapter.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-semibold ${activeChapter === idx ? 'text-primary-400' : 'text-gray-300 group-hover:text-white'
                                            }`}>
                                            {chapter.title}
                                        </h4>
                                        <p className="text-xs text-gray-500">{chapter.duration}</p>
                                    </div>
                                    {activeChapter === idx && (
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
