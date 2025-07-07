/**
 * AnimationController - Handles GSAP animations with memory efficiency
 * Optimized for smooth performance and proper cleanup
 */

export class AnimationController {
    constructor(options = {}) {
        this.config = {
            duration: 1500,
            enabled: true,
            easing: 'power2.out',
            ...options
        }
        
        this.activeAnimations = new Set()
        this.animationQueue = []
        this.isProcessing = false
        this.performanceMode = false
        
        this.setupPerformanceMonitoring()
    }
    
    /**
     * Create optimized animation with memory management
     * @param {Object} targets - Animation targets
     * @param {Object} properties - Animation properties
     * @param {Object} options - Animation options
     * @returns {Object} Animation instance
     */
    create(targets, properties, options = {}) {
        if (!this.config.enabled) {
            // Apply final state immediately if animations disabled
            this.applyFinalState(targets, properties)
            return { kill: () => {} }
        }
        
        const animationConfig = {
            duration: options.duration || this.config.duration,
            ease: options.easing || this.config.easing,
            ...properties
        }
        
        // Add cleanup callback
        const originalOnComplete = animationConfig.onComplete
        animationConfig.onComplete = () => {
            this.activeAnimations.delete(animation)
            if (originalOnComplete) originalOnComplete()
        }
        
        // Use GSAP if available globally
        if (typeof gsap !== 'undefined') {
            const animation = gsap.to(targets, animationConfig)
            this.activeAnimations.add(animation)
            return animation
        }
        
        // Fallback to CSS animations
        return this.createCSSAnimation(targets, properties, options)
    }
    
    /**
     * Batch multiple animations for better performance
     * @param {Array} animations - Array of animation configs
     * @returns {Promise<void>}
     */
    async batch(animations) {
        if (this.performanceMode) {
            // In performance mode, apply final states immediately
            animations.forEach(({ targets, properties }) => {
                this.applyFinalState(targets, properties)
            })
            return
        }
        
        const timeline = this.createTimeline()
        
        animations.forEach(({ targets, properties, options = {} }) => {
            timeline.add(this.create(targets, properties, options), options.delay || 0)
        })
        
        return timeline.play()
    }
    
    /**
     * Create animation timeline
     * @returns {Object} Timeline instance
     */
    createTimeline() {
        if (typeof gsap !== 'undefined') {
            return gsap.timeline()
        }
        
        // Fallback timeline implementation
        return {
            animations: [],
            add: function(animation, delay = 0) {
                this.animations.push({ animation, delay })
                return this
            },
            play: async function() {
                for (const { animation, delay } of this.animations) {
                    if (delay > 0) {
                        await new Promise(resolve => setTimeout(resolve, delay))
                    }
                    // Execute animation
                }
            }
        }
    }
    
    /**
     * Apply final state without animation
     * @param {Object} targets - Animation targets
     * @param {Object} properties - Properties to apply
     */
    applyFinalState(targets, properties) {
        const elements = Array.isArray(targets) ? targets : [targets]
        
        elements.forEach(element => {
            if (element && element.style) {
                Object.keys(properties).forEach(prop => {
                    if (prop !== 'onComplete' && prop !== 'onUpdate') {
                        element.style[prop] = properties[prop]
                    }
                })
            }
        })
    }
    
    /**
     * Create CSS-based animation fallback
     * @param {Object} targets - Animation targets
     * @param {Object} properties - Animation properties
     * @param {Object} options - Animation options
     * @returns {Object} Animation control object
     */
    createCSSAnimation(targets, properties, options = {}) {
        const elements = Array.isArray(targets) ? targets : [targets]
        const duration = options.duration || this.config.duration
        
        elements.forEach(element => {
            if (element && element.style) {
                // Set transition
                element.style.transition = `all ${duration}ms ${this.config.easing}`
                
                // Apply properties
                Object.keys(properties).forEach(prop => {
                    if (prop !== 'onComplete' && prop !== 'onUpdate') {
                        element.style[prop] = properties[prop]
                    }
                })
                
                // Handle completion
                if (properties.onComplete) {
                    setTimeout(properties.onComplete, duration)
                }
            }
        })
        
        return {
            kill: () => {
                elements.forEach(element => {
                    if (element && element.style) {
                        element.style.transition = ''
                    }
                })
            }
        }
    }
    
    /**
     * Kill all active animations
     */
    killAll() {
        this.activeAnimations.forEach(animation => {
            if (animation && animation.kill) {
                animation.kill()
            }
        })
        this.activeAnimations.clear()
        
        console.log('🎭 All animations killed')
    }
    
    /**
     * Pause all animations
     */
    pauseAll() {
        this.activeAnimations.forEach(animation => {
            if (animation && animation.pause) {
                animation.pause()
            }
        })
        
        console.log('⏸️ All animations paused')
    }
    
    /**
     * Resume all animations
     */
    resumeAll() {
        this.activeAnimations.forEach(animation => {
            if (animation && animation.resume) {
                animation.resume()
            }
        })
        
        console.log('▶️ All animations resumed')
    }
    
    /**
     * Set performance mode
     * @param {boolean} enabled - Enable performance mode
     */
    setPerformanceMode(enabled) {
        this.performanceMode = enabled
        
        if (enabled) {
            this.killAll()
            console.log('🚀 Performance mode enabled - animations simplified')
        } else {
            console.log('🎭 Performance mode disabled - full animations restored')
        }
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor frame rate and automatically adjust
        let frameCount = 0
        let lastTime = performance.now()
        
        const checkPerformance = () => {
            frameCount++
            const currentTime = performance.now()
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount
                frameCount = 0
                lastTime = currentTime
                
                // Auto-enable performance mode if FPS is low
                if (fps < 30 && !this.performanceMode) {
                    console.warn('⚠️ Low FPS detected, enabling performance mode')
                    this.setPerformanceMode(true)
                } else if (fps > 50 && this.performanceMode) {
                    console.log('✅ FPS improved, disabling performance mode')
                    this.setPerformanceMode(false)
                }
            }
            
            requestAnimationFrame(checkPerformance)
        }
        
        requestAnimationFrame(checkPerformance)
    }
    
    /**
     * Get animation statistics
     * @returns {Object} Animation stats
     */
    getStats() {
        return {
            activeAnimations: this.activeAnimations.size,
            performanceMode: this.performanceMode,
            queuedAnimations: this.animationQueue.length,
            isProcessing: this.isProcessing
        }
    }
    
    /**
     * Cleanup all resources
     */
    cleanup() {
        this.killAll()
        this.animationQueue = []
        this.isProcessing = false
        
        console.log('🧹 AnimationController cleanup complete')
    }
} 