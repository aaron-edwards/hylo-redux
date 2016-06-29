import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { prefetch, defer } from 'react-fetcher'
import { get, pick } from 'lodash'
import {
  fetchCommunity,
  navigate,
  setCurrentCommunityId,
  updateUserSettings
} from '../../actions'
import { fetchLeftNavTags } from '../../actions/tags'
import { locationWithoutParams } from '../../client/util'
import { VIEWED_COMMUNITY, trackEvent } from '../../util/analytics'
import { VelocityTransitionGroup } from 'velocity-react'
import ListItemTagInput from '../../components/ListItemTagInput'
import CoverImagePage from '../../components/CoverImagePage'
import { preventSpaces } from '../../util/textInput'
const { func, object } = React.PropTypes

const CommunityProfile = props => {
  let { community, currentUser, location, dispatch, children } = props

  // we might have partial data for a community already; if this component
  // renders without banner_url, it'll cause a request to an invalid url
  if (!community || !community.banner_url) {
    return <div className='loading'>Loading...</div>
  }

  const showOnboarding = get(location, 'query.onboarding')

  return <CoverImagePage id='community' image={community.banner_url}>
    <VelocityTransitionGroup runOnMount={true}
      enter={{animation: 'slideDown', duration: 800}}
      leave={{animation: 'slideUp', duration: 800}}>
      {showOnboarding && <OnboardingQuestions person={currentUser} dispatch={dispatch}/>}
    </VelocityTransitionGroup>
    {children}
  </CoverImagePage>
}

CommunityProfile.propTypes = {
  community: object,
  currentUser: object,
  children: object,
  location: object,
  dispatch: func
}

export default compose(
  prefetch(({ store, dispatch, params: { id } }) => dispatch(fetchLeftNavTags(id))
    .then(() => dispatch(fetchCommunity(id)))
    .then(() => {
      const community = store.getState().communities[id]
      community && dispatch(setCurrentCommunityId(community.id))
    })),
  defer(({ params: { id }, store }) => {
    const community = store.getState().communities[id]
    return trackEvent(VIEWED_COMMUNITY, {community})
  }),
  connect((state, props) => ({
    community: state.communities[props.params.id],
    currentUser: state.people.current
  }))
)(CommunityProfile)

const OnboardingQuestions = ({ person, dispatch }) => {
  let update = (field, value) =>
    dispatch(updateUserSettings(person.id, {[field]: value}, pick(person, field)))

  let close = () => dispatch(navigate(locationWithoutParams('onboarding')))

  return <div className='onboarding-questions'>
    <div className='header'>
      <h3>Let's get started</h3>
    </div>
    <div className='content'>
      <p>Tell us a little about yourself! Are there any <strong>skills, passions, or hobbies</strong> you'd like to be known for in your community?</p>
      <ListItemTagInput type='tags' person={person} update={update}
        filter={preventSpaces}/>
      <p className='meta'>
        Type words, pressing Enter after each one. You can type phrases "like-this" or LikeThis. These tags will be searchable and visible on your profile, and can be edited later. They help you and your fellow community members discover opportunities to do more together.
      </p>
      <div className='align-right'>
        <button onClick={close} className='btn-primary'>Done</button>
      </div>
    </div>
  </div>
}
