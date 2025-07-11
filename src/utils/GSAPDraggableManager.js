/**
 * Ultra-High-Performance GSAP Draggable System
 * INSTANT RESPONSE - Zero lag, 60fps smooth dragging
 * Optimized for maximum performance and snappy feel
 */

export const GSAPDraggableManager = {
    instances: new Map(),
    
    // Initialize ultra-performance dragging for a panel
    initializeDraggable(panelElement, options = {}) {
        if (!panelElement) {
            console.warn('⚠️ No panel element provided for draggable initialization');
            return null;
        }
        
        // Check if element is already draggable
        const panelId = panelElement.id || `draggable-${Date.now()}`;
        if (this.instances.has(panelId)) {
            console.log(`🔄 Cleaning up existing draggable: ${panelId}`);
            this.destroyDraggable(panelId);
        }
        
        // Add ID if not present
        if (!panelElement.id) {
            panelElement.id = panelId;
        }
        
        // Check GSAP availability
        if (typeof window !== 'undefined' && window.gsap && window.Draggable) {
            console.log(`⚡ Initializing ULTRA-FAST GSAP draggable: ${panelId}`);
            return this.initializeGSAPDraggable(panelElement, options);
        } else {
            console.warn('⚠️ GSAP or Draggable not available - using ULTRA-FAST fallback dragging');
            return this.initializeFallbackDraggable(panelElement, options);
        }
    },
    
    // GSAP-powered dragging - ULTRA-HIGH PERFORMANCE
    initializeGSAPDraggable(panelElement, options = {}) {
        const panelId = panelElement.id;
        
        try {
            // Register GSAP plugin
            gsap.registerPlugin(Draggable);
            
            // Find drag handle - look for .panel-header or use whole element
            const dragHandle = panelElement.querySelector('.panel-header') || panelElement;
            
            // PRE-CALCULATE ALL PROPERTIES - Zero calculations during drag
            const preCalculateProperties = () => {
                return {
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    minX: -window.innerWidth,
                    maxX: window.innerWidth,
                    minY: -100,
                    maxY: window.innerHeight - 50
                };
            };
            
            let cachedProps = preCalculateProperties();
            
            // Set up maximum hardware acceleration
            gsap.set(panelElement, {
                willChange: 'transform',
                force3D: true,
                transformOrigin: 'center center',
                backfaceVisibility: 'hidden',
                cursor: 'grab'
            });
            
            // Create INSTANT-RESPONSE draggable instance
            const draggableInstance = Draggable.create(panelElement, {
                type: 'x,y',
                trigger: dragHandle,
                
                // MAXIMUM PERFORMANCE SETTINGS
                force3D: true,
                allowEventDefault: false,
                inertia: false,
                dragResistance: 0,
                edgeResistance: 0,
                allowNativeTouchScrolling: false,
                
                // INSTANT RESPONSE CALLBACKS
                onPress: function() {
                    // Minimal feedback - pre-calculated
                    this.target.style.cursor = 'grabbing';
                    this.target.style.zIndex = '9999';
                    // Update cached properties for current drag
                    cachedProps = preCalculateProperties();
                },
                
                onDragStart: function() {
                    console.log('🚀 INSTANT dragging started:', panelId);
                },
                
                // REMOVED: All onDrag processing - ZERO calculations during drag for maximum speed
                
                onDragEnd: function() {
                    console.log('✅ INSTANT drag ended:', panelId);
                    
                    // Use cached properties for bounds checking
                    const x = this.x;
                    const y = this.y;
                    
                    // Calculate constrained position using cached values
                    const constrainedX = Math.max(cachedProps.minX, Math.min(cachedProps.maxX, x));
                    const constrainedY = Math.max(cachedProps.minY, Math.min(cachedProps.maxY, y));
                    
                    // Apply bounds only if position changed
                    if (constrainedX !== x || constrainedY !== y) {
                        gsap.to(this.target, {
                            duration: 0.2,
                            ease: 'power2.out',
                            x: constrainedX,
                            y: constrainedY
                        });
                    }
                    
                    // Reset visual state
                    this.target.style.cursor = 'grab';
                    this.target.style.zIndex = '1000';
                }
            })[0];
            
            // Store instance data
            const instance = {
                element: panelElement,
                gsapInstance: draggableInstance,
                type: 'gsap',
                cleanup: () => {
                    console.log(`🧹 Cleaning up ULTRA-FAST GSAP draggable: ${panelId}`);
                    if (draggableInstance) {
                        draggableInstance.kill();
                    }
                    gsap.set(panelElement, { clearProps: 'all' });
                }
            };
            
            this.instances.set(panelId, instance);
            console.log(`✅ ULTRA-FAST GSAP draggable ready: ${panelId}`);
            
            return instance;
            
        } catch (error) {
            console.error('❌ GSAP draggable failed, using ULTRA-FAST fallback:', error);
            return this.initializeFallbackDraggable(panelElement, options);
        }
    },
    
    // ULTRA-HIGH-PERFORMANCE Fallback System - INSTANT RESPONSE
    initializeFallbackDraggable(panelElement, options = {}) {
        const panelId = panelElement.id;
        
        console.log(`🔄 Initializing ULTRA-FAST fallback draggable: ${panelId}`);
        
        // Find drag handle
        const dragHandle = panelElement.querySelector('.panel-header') || panelElement;
        
        // PERFORMANCE VARIABLES - Pre-allocated to avoid garbage collection
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;
        let currentX = 0;
        let currentY = 0;
        let animationId = null;
        
        // PRE-CALCULATE BOUNDS - Zero calculations during drag
        let cachedBounds = {
            minX: -window.innerWidth,
            maxX: window.innerWidth,
            minY: -100,
            maxY: window.innerHeight - 50
        };
        
        // Update cached bounds
        const updateBounds = () => {
            cachedBounds.minX = -window.innerWidth;
            cachedBounds.maxX = window.innerWidth;
            cachedBounds.minY = -100;
            cachedBounds.maxY = window.innerHeight - 50;
        };
        
        // ULTRA-FAST RENDER FUNCTION - RequestAnimationFrame for 60fps smoothness
        const renderTransform = () => {
            if (!isDragging) return;
            
            // Direct transform manipulation - fastest possible method
            panelElement.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            
            // Continue animation loop
            animationId = requestAnimationFrame(renderTransform);
        };
        
        // INSTANT START Handler
        const handleStart = (e) => {
            // Prevent dragging on interactive elements
            if (e.target.closest('button, input, select, textarea, .expand-btn')) {
                return;
            }
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (!clientX || !clientY) return;
            
            isDragging = true;
            startX = clientX;
            startY = clientY;
            
            // Update bounds cache
            updateBounds();
            
            // Get current transform - optimized
            const style = window.getComputedStyle(panelElement);
            const transform = style.transform;
            
            if (transform && transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                initialX = matrix.m41;
                initialY = matrix.m42;
            } else {
                initialX = 0;
                initialY = 0;
            }
            
            // Set initial position
            currentX = initialX;
            currentY = initialY;
            
            // MINIMAL visual feedback
            panelElement.style.cursor = 'grabbing';
            panelElement.style.zIndex = '9999';
            
            // Start render loop
            animationId = requestAnimationFrame(renderTransform);
            
            // Add event listeners with passive optimization
            document.addEventListener('mousemove', handleMove, { passive: true });
            document.addEventListener('mouseup', handleEnd, { passive: true });
            document.addEventListener('touchmove', handleMove, { passive: true });
            document.addEventListener('touchend', handleEnd, { passive: true });
            
            // Prevent default
            e.preventDefault();
            
            console.log('🎯 ULTRA-FAST drag started:', panelId);
        };
        
        // INSTANT MOVE Handler - Zero calculations, maximum speed
        const handleMove = (e) => {
            if (!isDragging) return;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (!clientX || !clientY) return;
            
            // ULTRA-FAST position calculation - minimal operations
            currentX = initialX + (clientX - startX);
            currentY = initialY + (clientY - startY);
            
            // Note: Transform update happens in renderTransform via requestAnimationFrame
            // This ensures 60fps smooth updates without blocking the main thread
        };
        
        // INSTANT END Handler
        const handleEnd = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            
            // Cancel animation loop
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            // Apply final bounds check using cached values
            const constrainedX = Math.max(cachedBounds.minX, Math.min(cachedBounds.maxX, currentX));
            const constrainedY = Math.max(cachedBounds.minY, Math.min(cachedBounds.maxY, currentY));
            
            // Set final position
            panelElement.style.transform = `translate3d(${constrainedX}px, ${constrainedY}px, 0)`;
            
            // Reset visual state
            panelElement.style.cursor = 'grab';
            panelElement.style.zIndex = '1000';
            
            // Remove event listeners
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
            
            console.log('✅ ULTRA-FAST drag ended:', panelId);
        };
        
        // Set up MAXIMUM PERFORMANCE styles
        panelElement.style.cursor = 'grab';
        panelElement.style.willChange = 'transform';
        panelElement.style.userSelect = 'none';
        panelElement.style.touchAction = 'none';
        panelElement.style.webkitUserSelect = 'none';
        panelElement.style.webkitTouchCallout = 'none';
        panelElement.style.webkitTapHighlightColor = 'transparent';
        
        // Add event listeners to drag handle
        dragHandle.addEventListener('mousedown', handleStart, { passive: false });
        dragHandle.addEventListener('touchstart', handleStart, { passive: false });
        
        // Store instance
        const instance = {
            element: panelElement,
            type: 'fallback',
            cleanup: () => {
                console.log(`🧹 Cleaning up ULTRA-FAST fallback draggable: ${panelId}`);
                
                // Cancel any active animation
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                
                // Remove event listeners
                dragHandle.removeEventListener('mousedown', handleStart);
                dragHandle.removeEventListener('touchstart', handleStart);
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleEnd);
                document.removeEventListener('touchmove', handleMove);
                document.removeEventListener('touchend', handleEnd);
                
                // Reset styles
                panelElement.style.cursor = '';
                panelElement.style.willChange = '';
                panelElement.style.userSelect = '';
                panelElement.style.touchAction = '';
                panelElement.style.webkitUserSelect = '';
                panelElement.style.webkitTouchCallout = '';
                panelElement.style.webkitTapHighlightColor = '';
                panelElement.style.transform = '';
                panelElement.style.zIndex = '';
            }
        };
        
        this.instances.set(panelId, instance);
        console.log(`✅ ULTRA-FAST fallback draggable ready: ${panelId}`);
        
        return instance;
    },
    
    // Clean up draggable instance
    destroyDraggable(panelId) {
        if (this.instances.has(panelId)) {
            const instance = this.instances.get(panelId);
            if (instance && instance.cleanup) {
                instance.cleanup();
            }
            this.instances.delete(panelId);
            console.log(`🗑️ Cleaned up draggable: ${panelId}`);
        }
    },
    
    // Cleanup all instances
    destroyAll() {
        console.log('🧹 Cleaning up all draggable instances...');
        this.instances.forEach((instance, panelId) => {
            this.destroyDraggable(panelId);
        });
        console.log('✅ All draggable instances cleaned up');
    },
    
    // Get status of all draggable instances
    getStatus() {
        const status = {};
        this.instances.forEach((instance, panelId) => {
            status[panelId] = {
                active: !!instance,
                type: instance.type || 'unknown',
                element: instance.element || null,
                hasGsap: instance.gsapInstance ? true : false
            };
        });
        return status;
    },
    
    // Debug function to log all instances
    debugInstances() {
        console.log('🔍 Debug: Active draggable instances:');
        console.table(this.getStatus());
    }
};

// Simple initialization function for Vue components
export function initializeEnhancedDraggable(panelRef) {
    if (!panelRef) {
        console.warn('⚠️ Panel ref not available for draggable initialization');
        return null;
    }
    
    // Add unique ID if not present
    if (!panelRef.id) {
        panelRef.id = `enhanced-panel-${Date.now()}`;
    }
    
    console.log('🎯 Initializing ULTRA-FAST enhanced draggable for:', panelRef.id);
    return GSAPDraggableManager.initializeDraggable(panelRef);
}

// Cleanup function
export function cleanupAllDraggables() {
    GSAPDraggableManager.destroyAll();
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.GSAPDraggableManager = GSAPDraggableManager;
}

// Export default for easier importing
export default GSAPDraggableManager; 