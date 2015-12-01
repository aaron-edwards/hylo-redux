import React from 'react'
import Post from '../components/Post'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetchComments, fetchPost } from '../actions'
import { join } from 'bluebird'
const { object } = React.PropTypes

const SinglePost = props => {
  let { post } = props
  if (!post) return <div className='loading'>Loading...</div>

  return <div>
    <Post post={post} expanded={true} commentsExpanded={true}/>
  </div>
}

SinglePost.propTypes = {
  post: object.isRequired
}

export default compose(
  prefetch(({ dispatch, params }) => join(
    dispatch(fetchPost(params.id)),
    dispatch(fetchComments(params.id))
  )),
  connect(({ posts }, { params }) => ({post: posts[params.id]}))
)(SinglePost)
