import './style.css'

/***********************
 *      Variables       *
 ***********************/

let expandedCard
let initialProperties = []
let finalProperties = []
let cardClip

/***********************
 *    Helper Functions   *
 ***********************/

function getAnimatableElements() {
  if (!expandedCard) return
  return expandedCard.querySelectorAll('.js-animatable')
}

function getCardContent() {
  if (!expandedCard) return
  return expandedCard.querySelector('.card__content')
}

/***********************
 *        Setup        *
 ***********************/

function setup() {
  document.addEventListener('click', (e) => {
    if (expandedCard) return

    if (e.target.matches('.js-card')) {
      expandedCard = e.target
    } else if (e.target.closest('.js-card')) {
      expandedCard = e.target.closest('.js-card')
    }

    if (!expandedCard) return

    const closeButton = expandedCard.querySelector('.js-close-button')
    closeButton.addEventListener('click', collapse)

    expand()
  })
}

/********************
 *      Expand      *
 ********************/
function expand() {
  getCardContent().addEventListener('transitionend', onExpandTransitionEnd)

  disablePageScroll()
  collectInitialProperties()

  expandedCard.classList.add('card--expanded')

  collectFinalProperties()

  setInvertedTransformAndOpacity()
  clipCardContent()

  requestAnimationFrame(() => {
    expandedCard.classList.add('card--animatable')
    startExpanding()
  })
}

function collectInitialProperties() {
  for (const element of getAnimatableElements()) {
    initialProperties.push({
      rect: element.getBoundingClientRect(),
      opacity: parseFloat(window.getComputedStyle(element).opacity)
    })
  }

  const cardRect = expandedCard.getBoundingClientRect()
  cardClip = {
    top: cardRect.top,
    right: window.innerWidth - cardRect.right,
    bottom: window.innerHeight - cardRect.bottom,
    left: cardRect.left
  }
}

function collectFinalProperties() {
  const elements = getAnimatableElements()
  for (const element of elements) {
    finalProperties.push({
      rect: element.getBoundingClientRect(),
      opacity: parseFloat(window.getComputedStyle(element).opacity)
    })
  }
}

function setInvertedTransformAndOpacity() {
  const elements = getAnimatableElements()
  for (const [i, element] of elements.entries()) {
    element.style.transform = `translate(${
      initialProperties[i].rect.left - finalProperties[i].rect.left
    }px, ${
      initialProperties[i].rect.top - finalProperties[i].rect.top
    }px) scale(${
      initialProperties[i].rect.width / finalProperties[i].rect.width
    })`

    element.style.opacity = `${initialProperties[i].opacity}`
  }
}

function clipCardContent() {
  getCardContent().style.clipPath = `
    inset(${cardClip.top}px ${cardClip.right}px ${cardClip.bottom}px ${cardClip.left}px round 5px)
  `
}

function startExpanding() {
  for (const [i, element] of getAnimatableElements().entries()) {
    element.style.transform = 'translate(0, 0) scale(1)'
    element.style.opacity = `${finalProperties[i].opacity}`
  }

  getCardContent().style.clipPath = 'inset(0)'
}

function onExpandTransitionEnd(e) {
  const cardContent = getCardContent()
  if (e.target !== cardContent) return

  expandedCard.classList.remove('card--animatable')
  cardContent.removeEventListener('transitionend', onExpandTransitionEnd)
  removeStyles()
}

function removeStyles() {
  for (const element of getAnimatableElements()) {
    element.style = null
  }

  getCardContent().style = null
}

/**********************
 *      Collapse      *
 **********************/

function collapse() {
  getCardContent().addEventListener('transitionend', onCollapseTransitionEnd)

  setCollapsingInitialStyles()

  requestAnimationFrame(() => {
    expandedCard.classList.add('card--animatable')
    startCollapsing()
  })
}

function setCollapsingInitialStyles() {
  for (const element of getAnimatableElements()) {
    element.style.transform = `translate(0, 0) scale(1)`
  }

  getCardContent().style.clipPath = 'inset(0)'
}

function startCollapsing() {
  setInvertedTransformAndOpacity()
  clipCardContent()
}

function onCollapseTransitionEnd(e) {
  const cardContent = getCardContent()
  if (e.target !== cardContent) return

  expandedCard.classList.remove('card--animatable')
  expandedCard.classList.remove('card--expanded')

  cardContent.removeEventListener('transitionend', onCollapseTransitionEnd)

  removeStyles()
  enablePageScroll()

  cleanup()
}

function disablePageScroll() {
  document.body.style.overflow = 'hidden'
}

function enablePageScroll() {
  document.body.style.overflow = ''
}

function cleanup() {
  expandedCard = null
  cardClip = null
  initialProperties = []
  finalProperties = []
}

/***********************
 *      Start Here     *
 ***********************/

setup()
