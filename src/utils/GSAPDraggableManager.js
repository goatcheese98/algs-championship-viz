/**
 * Ultra-High-Performance GSAP Draggable System
 * INSTANT RESPONSE - Zero lag, 60fps smooth dragging
 * Optimized for maximum performance and snappy feel
 */

import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

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
        if (typeof gsap !== 'undefined' && typeof Draggable !== 'undefined') {
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
                    minX: -window.innerWidth + 100, // Allow some movement off-screen but keep accessible
                    maxX: window.innerWidth - 100,
                    minY: -window.innerHeight + 100, // FIXED: Allow full vertical movement
                    maxY: window.innerHeight - 100  // FIXED: Keep some margin from edges
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
                inertia: false,  // Disable inertia for instant stopping
                dragResistance: 0,  // Zero resistance for instant movement
                edgeResistance: 0,  // No edge resistance
                allowNativeTouchScrolling: false,
                lockAxis: false,
                
                // Efficient bounds (applied only at end)
                bounds: cachedProps,
                
                // INSTANT RESPONSE CALLBACKS
                onPress: function() {
                    // Minimal feedback - instant
                    gsap.set(this.target, { cursor: 'grabbing', zIndex: 9999 });
                    // Update cached properties for current drag
                    cachedProps = preCalculateProperties();
                    this.applyBounds(cachedProps); // Update bounds
                },
                
                onDragStart: function() {
                    console.log('🚀 INSTANT GSAP dragging started:', panelId);
                },
                
                // NO onDrag callback - maximum performance
                
                onDragEnd: function() {
                    console.log('✅ INSTANT GSAP drag ended:', panelId);
                    // Reset cursor
                    gsap.set(this.target, { cursor: 'grab', zIndex: 1000 });
                },
                
                onRelease: function() {
                    // Reset styles
                    gsap.set(this.target, { cursor: 'grab', zIndex: 1000 });
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
    
    // Fallback dragging system - ULTRA-HIGH PERFORMANCE
    initializeFallbackDraggable(panelElement, options = {}) {
        const panelId = panelElement.id;
        
        // Find drag handle - look for .panel-header or use whole element
        const dragHandle = panelElement.querySelector('.panel-header') || panelElement;
        
        // PERFORMANCE VARIABLES - Pre-allocated for zero GC pressure
        let isDragging = false;
        let startX = 0, startY = 0, currentX = 0, currentY = 0, initialX = 0, initialY = 0;
        let lastMoveTime = 0;
        const THROTTLE_MS = 8; // ~120fps throttling for ultra smooth movement
        
        // PRE-CALCULATE BOUNDS - No calculations during drag
        let bounds = {
            maxX: window.innerWidth - 100,
            maxY: window.innerHeight - 100,
            minX: -window.innerWidth + 100,
            minY: -window.innerHeight + 100
        };
        
        // Update bounds on window resize (debounced)
        let resizeTimeout;
        const updateBoundsOnResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                bounds = {
                    maxX: window.innerWidth - 100,
                    maxY: window.innerHeight - 100,
                    minX: -window.innerWidth + 100,
                    minY: -window.innerHeight + 100
                };
            }, 100);
        };
        window.addEventListener('resize', updateBoundsOnResize);
        
        // ULTRA-FAST position update - Direct DOM manipulation
        const updatePosition = (x, y) => {
            // Constrain to bounds
            const constrainedX = Math.max(bounds.minX, Math.min(bounds.maxX, x));
            const constrainedY = Math.max(bounds.minY, Math.min(bounds.maxY, y));
            
            // Direct transform update - fastest method
            panelElement.style.transform = `translate3d(${constrainedX}px, ${constrainedY}px, 0)`;
        };
        
        // INSTANT START Handler - Minimal calculations
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
            
                         // Get current position efficiently - parse transform directly
             const transform = panelElement.style.transform;
             if (transform && transform.includes('translate3d')) {
                 // Parse translate3d(x, y, z) values directly
                 const match = transform.match(/translate3d\(([^,]+)px,\s*([^,]+)px/);
                 if (match) {
                     initialX = parseFloat(match[1]) || 0;
                     initialY = parseFloat(match[2]) || 0;
                 }
             } else {
                 initialX = 0;
                 initialY = 0;
             }
            
            currentX = initialX;
            currentY = initialY;
            
            // MINIMAL visual feedback
            panelElement.style.cursor = 'grabbing';
            panelElement.style.zIndex = '9999';
            
            // Add event listeners - NOT passive for instant response
            document.addEventListener('mousemove', handleMove, { passive: false });
            document.addEventListener('mouseup', handleEnd, { passive: false });
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleEnd, { passive: false });
            
            e.preventDefault();
            console.log('🎯 ULTRA-FAST drag started:', panelId);
        };
        
        // INSTANT MOVE Handler - Throttled for optimal performance
        const handleMove = (e) => {
            if (!isDragging) return;
            
            // Throttle for optimal performance (120fps max)
            const now = performance.now();
            if (now - lastMoveTime < THROTTLE_MS) return;
            lastMoveTime = now;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (!clientX || !clientY) return;
            
            // ULTRA-FAST position calculation
            currentX = initialX + (clientX - startX);
            currentY = initialY + (clientY - startY);
            
            // Immediate position update - no RAF needed
            updatePosition(currentX, currentY);
            
            e.preventDefault();
        };
        
        // INSTANT END Handler
        const handleEnd = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            
            // Final position update
            updatePosition(currentX, currentY);
            
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
                
                // Remove resize listener
                window.removeEventListener('resize', updateBoundsOnResize);
                
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
    },
    
    // Add cleanup method for backward compatibility
    cleanup(instanceOrId) {
        if (typeof instanceOrId === 'string') {
            // If it's a string, treat it as an ID
            this.destroyDraggable(instanceOrId);
        } else if (instanceOrId && instanceOrId.cleanup) {
            // If it's an instance with cleanup method, call it
            instanceOrId.cleanup();
        } else {
            console.warn('⚠️ Invalid cleanup parameter:', instanceOrId);
        }
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