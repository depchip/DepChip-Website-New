$(document).ready(function($) {

	"use strict";

	// loader
	var loader = function() {
		const backgroundVideo = document.getElementById("background-video");

		// Log video element for debugging
		console.log('Video element:', backgroundVideo);
		console.log('Video src:', backgroundVideo ? backgroundVideo.querySelector('source').src : 'No video element');

		// Set a maximum timeout to hide loader regardless
		const maxLoadTime = setTimeout(() => {
			console.log('Max load time reached, hiding loader');
			if ($('#ftco-loader').length > 0) {
				$('#ftco-loader').removeClass('show');
				$('#ftco-loader').fadeOut(600);
			}
		}, 3000); // 3 seconds max

		if (!backgroundVideo) {
			console.error('Video element not found');
			clearTimeout(maxLoadTime);
			if ($('#ftco-loader').length > 0) {
				$('#ftco-loader').removeClass('show');
				$('#ftco-loader').fadeOut(600);
			}
			return;
		}

		// Force video to be visible
		backgroundVideo.style.opacity = '1';
		backgroundVideo.style.display = 'block';

		backgroundVideo.load();

		// Safari requires this for proper loading
		backgroundVideo.play().then(() => {
			console.log('Video playback started successfully');
		}).catch((error) => {
			console.error('Video autoplay failed:', error);
			// If autoplay fails, just hide the loader
			clearTimeout(maxLoadTime);
			if ($('#ftco-loader').length > 0) {
				$('#ftco-loader').removeClass('show');
				$('#ftco-loader').fadeOut(600);
			}
		});

		// Handle buffering
		backgroundVideo.addEventListener('waiting', () => {
			console.log('Video buffering...');
			if ($('#ftco-loader').length > 0) {
				$('#ftco-loader').addClass('show');
			}
		});

		// Handle successful playback
		backgroundVideo.addEventListener('playing', () => {
			console.log('Video playing successfully');
			clearTimeout(maxLoadTime);
			setTimeout(() => {
				if ($('#ftco-loader').length > 0) {
					$('#ftco-loader').removeClass('show');
					$('#ftco-loader').fadeOut(600);
				}
			}, 1500);
		});

		// Handle when video can start playing
		backgroundVideo.addEventListener('canplay', () => {
			console.log('Video can play');
		});

		// Handle errors
		backgroundVideo.addEventListener('error', (e) => {
			console.error('Video loading failed:', e);
			console.error('Video error code:', backgroundVideo.error ? backgroundVideo.error.code : 'unknown');
			clearTimeout(maxLoadTime);
			if ($('#ftco-loader').length > 0) {
				$('#ftco-loader').removeClass('show');
				$('#ftco-loader').fadeOut(600);
			}
		});
		
		const messages = [
			"Your idea deserves intelligence.",
			"AI isn’t the future it’s your competitive edge.",
			"Building the next unicorn? Start with smart code.",
			"Innovation moves faster with AI in the driver’s seat.",
			"Turning bold ideas into intelligent products.",
			"Smarter code. Faster growth. Bigger impact.",
			"From spark to scale powered by AI.",
			"Tomorrow’s products are being built today by us.",
			"Dream it. Code it. Automate it.",
			"Where startups evolve into smart enterprises.",
			"AI is your unfair advantage let’s use it.",
			"We don’t just build apps. We build intelligence.",
			"Launching brilliance one algorithm at a time.",
			"Speed. Scale. Intelligence. Delivered.",
			"Smart tech for bold thinkers."
		];

  
		function changeMessage() {
			let messageElement = document.getElementById("ai-message");
  
			// Start fade-out animation
			messageElement.style.animation = "fadeOut 1s ease-in-out";
			messageElement.style.opacity = "0";
  
			setTimeout(() => {
				// Change text
				let messageIndex = Math.floor(Math.random() * messages.length);
				messageElement.innerText = messages[messageIndex];
  
				// Start fade-in animation
				messageElement.style.animation = "fadeIn 1s ease-in-out";
				messageElement.style.opacity = "1";
			}, 1000); // Wait for fade-out before changing text
		}
  
		setInterval(changeMessage, 3000);
	};
	loader();

	// var loader = function () {
	// 	const backgroundVideo = document.getElementById("background-video");
	// 	let factCount = 0; // Track number of facts displayed
	// 	let videoLoaded = false; // Track if video is fully loaded
	// 	let minFactsToShow = 3; // Ensure at least 3 facts are shown before hiding loader
	
	// 	backgroundVideo.load();
	
	// 	// Safari requires this for proper loading
	// 	backgroundVideo.play().catch(() => {});
	
	// 	// Handle buffering (show loader if needed)
	// 	backgroundVideo.addEventListener('waiting', () => {
	// 		if ($('#ftco-loader').length > 0) {
	// 			$('#ftco-loader').addClass('show');
	// 		}
	// 	});
	
	// 	// Handle successful video playback
	// 	backgroundVideo.addEventListener('canplaythrough', () => {
	// 		videoLoaded = true; // Video is fully loaded
	// 		checkAndHideLoader();
	// 	});
	
	// 	// Handle video loading errors
	// 	backgroundVideo.addEventListener('error', () => {
	// 		console.error('Video loading failed');
	// 		checkAndHideLoader(); // Hide loader anyway if video fails
	// 	});
	
	// 	const messages = [
	// 		"AI is revolutionizing industries with predictive intelligence.",
	// 		"90% of top enterprises are investing in AI-driven automation.",
	// 		"AI-powered decisions improve efficiency by 40%.",
	// 		"Smart algorithms enhance customer personalization by 300%.",
	// 		"AI is driving a $15 trillion boost to the global economy by 2030.",
	// 		"Automation powered by AI saves companies millions annually."
	// 	];
	
	// 	function changeMessage() {
	// 		let messageElement = document.getElementById("ai-message");
	
	// 		// Start fade-out animation
	// 		messageElement.style.animation = "fadeOut 1s ease-in-out";
	// 		messageElement.style.opacity = "0";
	
	// 		setTimeout(() => {
	// 			// Change text
	// 			let messageIndex = Math.floor(Math.random() * messages.length);
	// 			messageElement.innerText = messages[messageIndex];
	
	// 			// Start fade-in animation
	// 			messageElement.style.animation = "fadeIn 1s ease-in-out";
	// 			messageElement.style.opacity = "1";
	
	// 			factCount++; // Increase the fact counter
	
	// 			// Check if it's time to hide the loader
	// 			checkAndHideLoader();
	
	// 		}, 1000); // Wait for fade-out before changing text
	// 	}
	
	// 	function checkAndHideLoader() {
	// 		if (factCount >= minFactsToShow && videoLoaded) {
	// 			// Ensure a smooth transition before hiding the loader
	// 			setTimeout(() => {
	// 				$('#ftco-loader').fadeOut(600); // Smooth fade-out effect
	// 			}, 1000);
	// 		}
	// 	}
	
	// 	// Start AI facts rotation every 3 seconds
	// 	setInterval(changeMessage, 3000);
	// };
	
	// Call the loader function
	// loader();
	

	var carousel = function() {
		$('.owl-carousel').owlCarousel({
			loop: true,
			margin: 10,
			nav: true,
			stagePadding: 5,
			nav: false,
			navText: ['<span class="icon-chevron-left">', '<span class="icon-chevron-right">'],
			responsive:{
				0:{
					items: 1
				},
				600:{
					items: 2
				},
				1000:{
					items: 3
				}
			}
		});
	};
	carousel();

	// scroll
	var scrollWindow = function() {
		$(window).scroll(function(){
			var $w = $(this),
					st = $w.scrollTop(),
					navbar = $('.ftco_navbar'),
					sd = $('.js-scroll-wrap');

			if (st > 150) {
				if ( !navbar.hasClass('scrolled') ) {
					navbar.addClass('scrolled');	
				}
			} 
			if (st < 150) {
				if ( navbar.hasClass('scrolled') ) {
					navbar.removeClass('scrolled sleep');
				}
			} 
			if ( st > 350 ) {
				if ( !navbar.hasClass('awake') ) {
					navbar.addClass('awake');	
				}
				
				if(sd.length > 0) {
					sd.addClass('sleep');
				}
			}
			if ( st < 350 ) {
				if ( navbar.hasClass('awake') ) {
					navbar.removeClass('awake');
					navbar.addClass('sleep');
				}
				if(sd.length > 0) {
					sd.removeClass('sleep');
				}
			}
		});
	};
	scrollWindow();

	var counter = function() {
		
		$('#section-counter').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('ftco-animated') ) {

				var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
				$('.ftco-number').each(function(){
					var $this = $(this),
						num = $this.data('number');
					$this.animateNumber(
					  {
					    number: num,
					    numberStep: comma_separator_number_step
					  }, 3000
					);
				});
				
			}

		} , { offset: '95%' } );

	}
	counter();
	
	

	var contentWayPoint = function() {
		var i = 0;
		$('.ftco-animate').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('ftco-animated') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .ftco-animate.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn ftco-animated');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft ftco-animated');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight ftco-animated');
							} else {
								el.addClass('fadeInUp ftco-animated');
							}
							el.removeClass('item-animate');
						},  k * 50, 'easeInOutExpo' );
					});
					
				}, 100);
				
			}

		} , { offset: '95%' } );
	};
	contentWayPoint();

	// navigation
	var OnePageNav = function() {
		$(".smoothscroll[href^='#'], #ftco-nav ul li a[href^='#'], .btn[href^='#']").on('click', function(e) {
			e.preventDefault();

			var hash = this.hash,
				navToggler = $('.navbar-toggler');
			$('html, body').animate({
				scrollTop: $(hash).offset().top
			}, 700, 'easeInOutExpo', function(){
				window.location.hash = hash;
			});

			if ( navToggler.is(':visible') ) {
				navToggler.click();
			}
		});
		$('body').on('activate.bs.scrollspy', function () {
			console.log('nice');
		})
	};
	OnePageNav();

});

document.addEventListener('DOMContentLoaded', () => {
	// ======================
	// Navigation Functions
	// ======================
	const nav = document.querySelector('.depchip-nav');
	const hamburger = document.querySelector('.hamburger');
	const navMenu = document.querySelector('.nav-links');
	const navLinks = document.querySelectorAll('.nav-links a');
  
	// ======================
	// Scroll Detection
	// ======================
	function handleScroll() {
	  // Toggle scrolled class
	  const scrolled = window.scrollY > 100;
	  nav.classList.toggle('scrolled', scrolled);
  
	  // Update active section
	  setActiveSection();
	}
  
	// ======================
	// Active Section Management
	// ======================
	function setActiveSection() {
	  const scrollPos = window.scrollY + 150;
	  
	  navLinks.forEach(link => {
		const section = document.querySelector(link.hash);
		if (!section) return;
		
		const sectionTop = section.offsetTop;
		const sectionBottom = sectionTop + section.offsetHeight;
		
		link.classList.toggle('active', scrollPos >= sectionTop && scrollPos <= sectionBottom);
	  });
	}
  
	// ======================
	// Mobile Menu Handling
	// ======================
	function toggleMobileMenu() {
	  hamburger.classList.toggle('active');
	  navMenu.classList.toggle('active');
	}
  
	function closeMobileMenu(e) {
	  if (!e.target.closest('.nav-container')) {
		hamburger.classList.remove('active');
		navMenu.classList.remove('active');
	  }
	}
  
	// ======================
	// Smooth Scroll
	// ======================
	function handleSmoothScroll(e) {
		e.preventDefault();
		const target = document.querySelector(this.hash);
		if (target) {
		  target.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		  });
	  
		  // Close mobile menu after clicking a link
		  hamburger.classList.remove('active');
		  navMenu.classList.remove('active');
		}
	}
  
	// ======================
	// Event Listeners
	// ======================
	window.addEventListener('scroll', handleScroll);
	window.addEventListener('load', handleScroll);
	
	hamburger.addEventListener('click', toggleMobileMenu);
	document.addEventListener('click', closeMobileMenu);
  
	// Smooth scroll for all anchor links
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	  anchor.addEventListener('click', handleSmoothScroll);
	});
  
	// ======================
	// Initialization
	// ======================
	// Initialize active section on page load
	setActiveSection();
	
	// Optional: Close mobile menu on resize
	window.addEventListener('resize', () => {
	  if (window.innerWidth > 1024) {
		hamburger.classList.remove('active');
		navMenu.classList.remove('active');
	  }
	});
  });
