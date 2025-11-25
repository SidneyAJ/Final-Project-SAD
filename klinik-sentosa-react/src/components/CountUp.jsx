import { useEffect, useState, useRef } from 'react'

export default function CountUp({ end, duration = 2000, suffix = '', prefix = '' }) {
    const [count, setCount] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [isVisible])

    useEffect(() => {
        if (!isVisible) return

        let startTime
        let animationFrame

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)

            setCount(Math.floor(progress * end))

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            }
        }

        animationFrame = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(animationFrame)
    }, [isVisible, end, duration])

    return (
        <span ref={ref}>
            {prefix}{count}{suffix}
        </span>
    )
}
