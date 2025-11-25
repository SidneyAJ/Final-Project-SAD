import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Heart, Activity, Users, Calendar, Shield, Clock,
    Target, Award, CheckCircle2, PlayCircle, ArrowRight,
    Stethoscope, Hospital, UserCheck, FileText,
    Monitor, Building, Phone, Mail, MessageCircle, MapPin, ExternalLink,
    ChevronRight, Smile, Star, TrendingUp, HelpCircle, Gift, MessageSquare, Quote, ChevronDown, ChevronUp
} from 'lucide-react'
import MedicalLogo from '../components/MedicalLogo'
import ScrollReveal from '../components/ScrollReveal'
import CountUp from '../components/CountUp'

export default function Home() {
    const [scrolled, setScrolled] = useState(false)
    const [openFaq, setOpenFaq] = useState(null)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const features = [
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Layanan Cepat",
            desc: "Antrian digital untuk pengalaman tanpa tunggu lama"
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Tim Berpengalaman",
            desc: "Dokter dan perawat profesional yang peduli"
        },
        {
            icon: <Smile className="w-6 h-6" />,
            title: "Ramah & Nyaman",
            desc: "Pelayanan hangat di lingkungan yang bersahabat"
        }
    ]

    const services = [
        {
            icon: Stethoscope,
            title: "Poli Umum",
            description: "Pemeriksaan kesehatan umum dengan dokter berpengalaman untuk seluruh keluarga."
        },
        {
            icon: Activity,
            title: "Pemeriksaan Lab",
            description: "Laboratorium dengan peralatan modern untuk hasil cepat dan akurat."
        },
        {
            icon: Heart,
            title: "Konsultasi Kesehatan",
            description: "Konsultasi lengkap untuk gaya hidup sehat dan pencegahan penyakit."
        },
        {
            icon: UserCheck,
            title: "Layanan Keluarga",
            description: "Perawatan kesehatan untuk ibu, anak, dan lansia dengan pendekatan personal."
        },
        {
            icon: FileText,
            title: "Medical Check Up",
            description: "Paket pemeriksaan kesehatan berkala untuk deteksi dini."
        },
        {
            icon: Shield,
            title: "Vaksinasi",
            description: "Program imunisasi lengkap untuk bayi, anak, dan dewasa."
        }
    ]

    const stats = [
        { number: 8, label: "Tahun Melayani", icon: Calendar, suffix: "+" },
        { number: 12, label: "Tenaga Medis", icon: Users, suffix: "+" },
        { number: 5000, label: "Pasien Puas", icon: CheckCircle2, suffix: "+" }
    ]

    const guideSteps = {
        online: [
            { title: "Buat Akun", desc: "Daftar akun baru atau login ke aplikasi" },
            { title: "Pilih Layanan", desc: "Pilih poli dan dokter yang dituju" },
            { title: "Dapat Nomor Antrian", desc: "Simpan nomor antrian digital Anda" }
        ],
        offline: [
            { title: "Ambil Nomor", desc: "Ambil nomor antrian di mesin kiosk" },
            { title: "Tunggu Panggilan", desc: "Tunggu nomor dipanggil di ruang tunggu" },
            { title: "Registrasi Loket", desc: "Verifikasi data di loket pendaftaran" }
        ]
    }

    const faqs = [
        {
            question: "Apakah menerima pasien BPJS?",
            answer: "Ya, Klinik Sentosa melayani pasien BPJS Kesehatan dan berbagai asuransi swasta lainnya."
        },
        {
            question: "Bagaimana cara mendaftar antrian online?",
            answer: "Anda dapat mendaftar melalui website ini dengan mengklik tombol 'Daftar Online' atau melalui aplikasi mobile kami."
        },
        {
            question: "Apakah ada layanan darurat 24 jam?",
            answer: "Saat ini layanan darurat kami tersedia 24 jam setiap hari dengan dokter jaga yang siap melayani."
        },
        {
            question: "Berapa biaya konsultasi dokter umum?",
            answer: "Biaya konsultasi dokter umum dimulai dari Rp 50.000. Untuk spesialis, biaya menyesuaikan dengan poli terkait."
        }
    ]

    const promos = [
        {
            title: "Paket Sehat Keluarga",
            desc: "Diskon 20% untuk Medical Check Up lengkap bagi keluarga (min. 3 orang).",
            code: "KELUARGA20",
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Vaksinasi Anak",
            desc: "Gratis konsultasi dokter anak untuk setiap paket vaksinasi lengkap.",
            code: "VAKSINSEHAT",
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Pemeriksaan Gigi",
            desc: "Scaling gigi hanya Rp 150.000 setiap hari Senin dan Kamis.",
            code: "GIGIBERSIH",
            color: "from-orange-500 to-red-500"
        }
    ]

    const testimonials = [
        {
            name: "Budi Santoso",
            role: "Pasien Umum",
            content: "Pelayanan sangat ramah dan cepat. Dokter menjelaskan dengan sangat detail dan mudah dimengerti.",
            rating: 5
        },
        {
            name: "Siti Aminah",
            role: "Ibu Rumah Tangga",
            content: "Fasilitas lengkap dan bersih. Anak saya tidak takut saat diperiksa karena dokternya sangat sabar.",
            rating: 5
        },
        {
            name: "Rudi Hermawan",
            role: "Karyawan Swasta",
            content: "Sistem antrian onlinenya sangat membantu, saya tidak perlu menunggu lama di klinik.",
            rating: 4
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <MedicalLogo size="md" variant={scrolled ? 'dark' : 'dark'} />
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#tentang" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Tentang</a>
                        <a href="#layanan" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Layanan</a>
                        <a href="#promo" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Promo</a>
                        <a href="#panduan" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Panduan</a>
                        <a href="#kontak" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Kontak</a>
                        <Link
                            to="/login"
                            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="tentang" className="relative pt-32 pb-20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
                    {/* Extra floating elements for more dynamism */}
                    <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-200/40 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-200/40 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <ScrollReveal direction="up">
                                <div className="inline-block">
                                    <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary-200 transition-colors">
                                        <Star className="w-4 h-4 fill-primary-600" />
                                        Klinik Terpercaya di Komunitas Anda
                                    </span>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal direction="up" delay={100}>
                                <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900">
                                    Kesehatan Keluarga <br />
                                    <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                        Prioritas Utama
                                    </span>
                                </h1>
                            </ScrollReveal>

                            <ScrollReveal direction="up" delay={200}>
                                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                                    Layanan kesehatan keluarga yang hangat, profesional, dan terpercaya dengan sistem antrian digital untuk kenyamanan Anda
                                </p>
                            </ScrollReveal>

                            {/* CTA Buttons */}
                            <ScrollReveal direction="up" delay={300}>
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        to="/register"
                                        className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
                                    >
                                        Daftar Sekarang
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </ScrollReveal>

                            {/* Stats */}
                            <ScrollReveal direction="up" delay={400}>
                                <div className="grid grid-cols-3 gap-6 pt-8">
                                    {stats.map((stat, idx) => (
                                        <div key={idx} className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300">
                                            <div className="flex justify-center mb-2">
                                                <stat.icon className="w-8 h-8 text-primary-600 group-hover:scale-125 transition-transform" />
                                            </div>
                                            <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                                <CountUp end={stat.number} suffix={stat.suffix || ""} />
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Hero Visual */}
                        <ScrollReveal direction="right" delay={200}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-200/50 to-secondary-200/50 rounded-3xl blur-3xl"></div>
                                <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20">
                                    {features.map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-4 p-5 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary-600 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800 mb-1">{feature.title}</h3>
                                                <p className="text-gray-600 text-sm">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Promo Section */}
            <section id="promo" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal direction="up">
                        <div className="text-center mb-12">
                            <div className="inline-block mb-4">
                                <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 mx-auto w-fit">
                                    <Gift className="w-4 h-4" />
                                    Penawaran Spesial
                                </span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                                Promo & Event <span className="text-primary-600">Terbaru</span>
                            </h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-3 gap-8">
                        {promos.map((promo, idx) => (
                            <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                                <div className={`relative overflow-hidden rounded-2xl p-8 h-full bg-gradient-to-br ${promo.color} text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group`}>
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                    <Gift className="w-10 h-10 mb-6 text-white/90" />
                                    <h3 className="text-2xl font-bold mb-3">{promo.title}</h3>
                                    <p className="text-white/90 mb-6">{promo.desc}</p>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 inline-block border border-white/30">
                                        <span className="text-sm font-medium">Kode: {promo.code}</span>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="layanan" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal direction="up">
                        <div className="text-center mb-16">
                            <div className="inline-block mb-4">
                                <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                                    Layanan Kami
                                </span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                                Layanan Kesehatan <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Terpadu</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Solusi kesehatan lengkap untuk keluarga Indonesia
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, idx) => (
                            <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 h-full">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                        <service.icon className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-primary-600 transition-colors">{service.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-gray-50 opacity-50"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <ScrollReveal direction="up">
                        <div className="text-center mb-16">
                            <div className="inline-block mb-4">
                                <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 mx-auto w-fit">
                                    <MessageSquare className="w-4 h-4" />
                                    Testimoni
                                </span>
                            </div>
                            <h2 className="text-4xl font-bold mb-4">Apa Kata <span className="text-primary-600">Mereka?</span></h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">Pengalaman nyata dari pasien yang telah mempercayakan kesehatannya kepada kami</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((item, idx) => (
                            <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                    <div className="mb-6 text-primary-500">
                                        <Quote className="w-10 h-10 opacity-20" />
                                    </div>
                                    <p className="text-gray-600 mb-6 flex-grow italic">"{item.content}"</p>
                                    <div className="flex items-center gap-4 mt-auto">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-500">{item.role}</p>
                                        </div>
                                        <div className="ml-auto flex gap-1">
                                            {[...Array(item.rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal direction="up">
                        <div className="text-center mb-12">
                            <div className="inline-block mb-4">
                                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 mx-auto w-fit">
                                    <HelpCircle className="w-4 h-4" />
                                    FAQ
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Pertanyaan Umum</h2>
                        </div>
                    </ScrollReveal>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <ScrollReveal key={idx} direction="up" delay={idx * 50}>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-semibold text-gray-800">{faq.question}</span>
                                        {openFaq === idx ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                    </button>
                                    <div
                                        className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${openFaq === idx ? 'max-h-40 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
                                            }`}
                                    >
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Panduan/Guide Section */}
            <section id="panduan" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal direction="up">
                        <div className="text-center mb-16">
                            <div className="inline-block mb-4">
                                <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                                    Panduan Pendaftaran
                                </span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                                Cara <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Mendaftar</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Pilih metode pendaftaran yang paling sesuai untuk Anda
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Online Registration */}
                        <ScrollReveal direction="left" delay={100}>
                            <div className="bg-gray-50 rounded-3xl shadow-lg p-8 hover:shadow-xl transition-all duration-500 h-full border border-gray-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                                        <Monitor className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Pendaftaran Online</h3>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {guideSteps.online.map((step, idx) => (
                                        <div key={idx} className="flex gap-4 group cursor-pointer">
                                            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold group-hover:bg-primary-600 group-hover:text-white group-hover:scale-110 transition-all">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 mb-1">{step.title}</h4>
                                                <p className="text-gray-600 text-sm">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    to="/register"
                                    className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    Daftar Online
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </ScrollReveal>

                        {/* Offline Registration */}
                        <ScrollReveal direction="right" delay={100}>
                            <div className="bg-gray-50 rounded-3xl shadow-lg p-8 hover:shadow-xl transition-all duration-500 h-full border border-gray-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center">
                                        <Building className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Datang Langsung</h3>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {guideSteps.offline.map((step, idx) => (
                                        <div key={idx} className="flex gap-4 group cursor-pointer">
                                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold group-hover:bg-gray-600 group-hover:text-white group-hover:scale-110 transition-all">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 mb-1">{step.title}</h4>
                                                <p className="text-gray-600 text-sm">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href="#kontak"
                                    className="group inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 hover:scale-105 transition-all"
                                >
                                    Lihat Lokasi
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="kontak" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal direction="up">
                        <div className="text-center mb-16">
                            <div className="inline-block mb-4">
                                <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                                    Hubungi Kami
                                </span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                                Informasi <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Kontak</span>
                            </h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Operating Hours */}
                        <ScrollReveal direction="up" delay={100}>
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 h-full">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Clock className="w-8 h-8 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-6 text-gray-800">Jam Operasional</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Senin - Jumat</span>
                                        <span className="font-semibold text-gray-800">08:00 - 18:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sabtu</span>
                                        <span className="font-semibold text-gray-800">08:00 - 16:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Minggu & Libur</span>
                                        <span className="font-semibold text-red-600">Tutup</span>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-primary-50 rounded-lg flex items-start gap-2">
                                    <Shield className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-primary-700">Layanan darurat 24/7 tersedia</p>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Contact Info */}
                        <ScrollReveal direction="up" delay={200}>
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 h-full">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Phone className="w-8 h-8 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-6 text-gray-800">Kontak Penting</h3>
                                <div className="space-y-4">
                                    <a href="tel:+6221123456" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                        <Phone className="w-5 h-5 text-primary-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">Telepon</p>
                                            <p className="font-semibold text-gray-800 group-hover:text-primary-600">(021) 123-456</p>
                                        </div>
                                    </a>
                                    <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                        <MessageCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">WhatsApp</p>
                                            <p className="font-semibold text-gray-800 group-hover:text-green-600">0812-3456-789</p>
                                        </div>
                                    </a>
                                    <a href="mailto:info@kliniksentosa.com" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-semibold text-gray-800 group-hover:text-blue-600">info@kliniksentosa.com</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Location */}
                        <ScrollReveal direction="up" delay={300}>
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 h-full">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mb-6">
                                    <MapPin className="w-8 h-8 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-6 text-gray-800">Alamat</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Jl. Arnold Mononutu, Airmadidi Bawah,<br />
                                    Kec. Airmadidi, Kabupaten Minahasa Utara,<br />
                                    Sulawesi Utara 95371
                                </p>
                                <a
                                    href="https://maps.app.goo.gl/xXpm1i53vjspQoR67"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold hover:bg-primary-600 hover:text-white hover:scale-105 transition-all group"
                                >
                                    Buka di Google Maps
                                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
                </div>
                <ScrollReveal direction="up">
                    <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Siap Memulai Perjalanan Kesehatan Anda?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Bergabunglah dengan ribuan keluarga yang telah mempercayakan kesehatan mereka kepada kami
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                to="/register"
                                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                            >
                                Daftar Gratis Sekarang
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 hover:scale-105 transition-all duration-300"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="mb-6">
                            <MedicalLogo size="lg" />
                        </div>
                        <div className="flex gap-6 mb-6">
                            <a href="#tentang" className="text-gray-400 hover:text-white transition-colors">Tentang</a>
                            <a href="#layanan" className="text-gray-400 hover:text-white transition-colors">Layanan</a>
                            <a href="#promo" className="text-gray-400 hover:text-white transition-colors">Promo</a>
                            <a href="#panduan" className="text-gray-400 hover:text-white transition-colors">Panduan</a>
                            <a href="#kontak" className="text-gray-400 hover:text-white transition-colors">Kontak</a>
                        </div>
                        <div className="text-gray-500 text-sm">
                            © 2025 Klinik Sentosa. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
