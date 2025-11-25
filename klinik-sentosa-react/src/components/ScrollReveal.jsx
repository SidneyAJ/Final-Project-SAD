import { useEffect, useRef, useState } from 'react'

export default function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }) {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay)
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [delay])

    const directions = {
        up: 'translate-y-20',
        down: '-translate-y-20',
        left: 'translate-x-20',
        right: '-translate-x-20'
    }

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${directions[direction]}`
                } ${className}`}
        >
            {children}
        </div>
    )
}
