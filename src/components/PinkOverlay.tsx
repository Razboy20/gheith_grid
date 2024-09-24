const PinkOverlay = () => {
  return (
    <>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter
            id="pink-filter"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            primitiveUnits="objectBoundingBox"
            color-interpolation-filters="sRGB"
          >
            {/* <!-- Compare RGB channel values --> */}
            <feColorMatrix
              type="matrix"
              in="SourceGraphic"
              result="test-r-gte-g"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  255 -255 0 0 1"
            />
            <feColorMatrix
              type="matrix"
              in="SourceGraphic"
              result="test-r-gte-b"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  255 0 -255 0 1"
            />

            <feColorMatrix
              type="matrix"
              in="SourceGraphic"
              result="test-g-gte-r"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -255 255 0 0 1"
            />
            <feColorMatrix
              type="matrix"
              in="SourceGraphic"
              result="test-g-gte-b"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 255 -255 0 1"
            />

            <feColorMatrix
              type="matrix"
              in="SourceGraphic"
              result="test-b-gte-r"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -255 0 255 0 1"
            />
            <feColorMatrix
              type="matrix"
              in="SourceGraphic"
              result="test-b-gte-g"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 -255 255 0 1"
            />

            {/* <!-- Logic masks for tone groups --> */}
            {/* <!-- For example: all red colors have red channel values greater than or equal to the green and blue values --> */}
            <feComposite operator="in" in="test-r-gte-g" in2="test-r-gte-b" result="red-mask" />
            <feComposite operator="in" in="test-g-gte-r" in2="test-g-gte-b" result="green-mask" />
            <feComposite operator="in" in="test-b-gte-r" in2="test-b-gte-g" result="blue-mask" />
            <feComposite operator="in" in="test-g-gte-r" in2="test-b-gte-r" result="cyan-mask" />
            <feComposite operator="in" in="test-b-gte-g" in2="test-r-gte-g" result="magenta-mask" />
            <feComposite operator="in" in="test-r-gte-b" in2="test-g-gte-b" result="yellow-mask" />

            {/* <!-- Select all colors in tone group --> */}
            {/* <!-- Note: uncomment the right tone group selection here --> */}
            {/* <!-- Note: greyscale colors will always be selected --> */}
            <feComposite operator="in" in="SourceGraphic" in2="red-mask" result="selection-red" />
            <feComposite operator="in" in="SourceGraphic" in2="green-mask" result="selection-green" />
            {/* <feComposite operator="in" in="SourceGraphic" in2="blue-mask" result="selection-blue" /> */}
            <feComposite operator="in" in="SourceGraphic" in2="cyan-mask" result="selection-cyan" />
            {/* <feComposite operator="in" in="SourceGraphic" in2="magenta-mask" result="selection" /> */}
            {/* <feComposite operator="in" in="SourceGraphic" in2="yellow-mask" result="selection" /> */}

            {/* <!-- Cut selection from original image --> */}
            {/* <!-- Note: use same mask for `in2` attribute as with selection --> */}
            {/* <feComposite operator="out" in="SourceGraphic" in2="red-mask" result="not-selected-source" /> */}

            {/* <!-- Apply effects to `selection` only --> */}
            <feColorMatrix type="hueRotate" values="305" in="selection-red" result="edited-selection-red" />
            <feColorMatrix type="hueRotate" values="140" in="selection-green" result="edited-selection-green" />
            <feColorMatrix type="hueRotate" values="75" in="selection-cyan" result="edited-selection-cyan" />
            {/* <!-- After all effects, adjustments, etc --> */}
            {/* <!-- the last `result` output name should be "edited-selection" --> */}

            {/* <!-- Bring it all together --> */}
            <feMerge>
              {/* Uncomment to check selection */}
              {/* <feMergeNode in="selection" /> */}
              {/* <feMergeNode in="not-selected-source" /> */}
              <feMergeNode in="edited-selection-red" />
              <feMergeNode in="edited-selection-cyan" />
              <feMergeNode in="edited-selection-green" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div class="fixed inset-0 pointer-events-none z-999999" style="backdrop-filter:url(#pink-filter);"></div>
    </>
  );
};

export default PinkOverlay;
