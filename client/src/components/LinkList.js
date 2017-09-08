import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'

import Link from './Link'

class LinkList extends Component {

  render() { 
    // 1
    if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
      return <div>Loading</div>
    }
  
    // 2
    if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
      console.log(this.props.allLinksQuery)
      return <div>Error</div>
    }
  
    // 3
    const linksToRender = this.props.allLinksQuery.allLinks
  
    return (
      <div>
        {linksToRender.map((link, index) => (
          <Link key={link.id} index={index} link={link}/>
        ))}
      </div>
    )
  }

  componentDidMount() {
    this._subscribeToNewLinks()
  }

  // subscribe
  _subscribeToNewLinks = () => {
    this.props.allLinksQuery.subscribeToMore({
      document: gql`
        subscription {
          Link(filter: {
            mutation_in: [CREATED]
          }) {
            node {
              id
              url
              description
              postedBy {
                id
                name
              }
              votes {
                id
                user {
                  id
                }
              }
            }
          }
        }
      `,
      // previous - previous data
      // subscriptionData - new data
      updateQuery: (previous, { subscriptionData }) => {
        const newAllLinks = [
          subscriptionData.data.Link.node,
          ...previous.allLinks
        ]
        const result = {
          ...previous,
          allLinks: newAllLinks
        }
        return result
      }
    })
  }

}

// parse plain graphql query
// name of query are using by Apollo
const ALL_LINKS_QUERY = gql`
  query AllLinksQuery {
    allLinks {
      id
      url
      description
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
  `

// 2nd parameter - name of prop passed to LinkList
export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery' }) (LinkList)