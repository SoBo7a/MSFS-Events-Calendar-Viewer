<!---------------------------------------------------------------------------------------------
 * Copyright (c) 2023 SoBo7a.
 * 
 * This file is part of MSFS Events Calendar Viewer <linkToMyRepo>.
 * 
 * MSFS Events Calendar Viewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * MSFS Events Calendar Viewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with MSFS Events Calendar Viewer.  If not, see <http://www.gnu.org/licenses/>.
 * -------------------------------------------------------------------------------------------->


<template>
    <div class="background-slideshow">
        <div class="background-image current" :style="{ backgroundImage: `url(${currentBgImage})`, opacity: currentOpacity }"></div>
        <div class="background-image next" :style="{ backgroundImage: `url(${nextBgImage})`, opacity: nextOpacity }"></div>
    </div>
</template>

<script>
import bgImg1 from '../assets/img/cropped-5120-2880-479484.jpg';
import bgImg2 from '../assets/img/cropped-5120-2880-113793.jpg';
import bgImg3 from '../assets/img/cropped-5120-2880-8537.jpg';


export default {
    name: 'BackgroundSlideshowComponent',

    data() {
        return {
            bgImages: [
                bgImg1,
                bgImg2,
                bgImg3,
            ],
            currentBgIndex: 0,
            nextBgIndex: 1,
            currentOpacity: 1,
            nextOpacity: 0,
        };
    },

    computed: {
        currentBgImage() {
            return this.bgImages[this.currentBgIndex];
        },
        nextBgImage() {
            return this.bgImages[this.nextBgIndex];
        },
    },

    mounted() {
        this.startBackgroundSlideshow();
    },

    methods: {
        getRandomBgIndex() {
            let newIndex = Math.floor(Math.random() * this.bgImages.length);
            
            // Generate a new index until it is different from the current index
            while (newIndex === this.currentBgIndex) {
            newIndex = Math.floor(Math.random() * this.bgImages.length);
            }
            
            return newIndex;
        },

        startBackgroundSlideshow() {
            this.currentBgIndex = this.getRandomBgIndex();

            setInterval(() => {
            this.nextBgIndex = this.getRandomBgIndex();
            this.fadeOutCurrentBgImage();
            }, 30000); // Change background image every N seconds (adjust the duration as needed)
        },

        fadeInCurrentBgImage() {
            this.currentOpacity = 1;
            this.nextOpacity = 0;
        },

        fadeOutCurrentBgImage() {
            this.currentOpacity = 0;
            this.nextOpacity = 1;

            setTimeout(() => {
            this.currentBgIndex = this.nextBgIndex;
            this.fadeInCurrentBgImage();
            }, 5000); // Wait for the fade-out transition to complete before updating the background image
        },
    },

};
</script>
